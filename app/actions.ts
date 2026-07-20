"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSessionUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getExercises() {
  const userId = await getSessionUserId();
  return prisma.exercise.findMany({
    where: { userId },
    orderBy: { name: "asc" }
  });
}

export async function createExercise(data: { name: string; bodyPart: string }) {
  const userId = await getSessionUserId();
  const exercise = await prisma.exercise.create({
    data: {
      name: data.name,
      bodyPart: data.bodyPart,
      userId,
    }
  });
  return exercise;
}

export async function getWorkouts() {
  const userId = await getSessionUserId();
  return prisma.workout.findMany({
    where: { userId },
    include: {
      sets: {
        include: { exercise: true }
      }
    },
    orderBy: { date: "desc" }
  });
}

export async function startWorkout() {
  const userId = await getSessionUserId();
  
  // Finish any lingering active workouts first
  await prisma.workout.updateMany({
    where: { userId, endTime: null },
    data: { endTime: new Date() }
  });

  const workout = await prisma.workout.create({
    data: {
      userId,
      date: new Date(),
    }
  });
  revalidatePath("/");
  revalidatePath("/workouts");
  revalidatePath("/today");
  return workout;
}

export async function getActiveWorkout() {
  noStore();
  const userId = await getSessionUserId();
  
  // Only consider workouts created in the last 12 hours as "active"
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

  return prisma.workout.findFirst({
    where: { 
      userId,
      endTime: null,
      date: {
        gte: twelveHoursAgo
      }
    },
    include: {
      workoutExercises: {
        include: { exercise: true },
        orderBy: { createdAt: 'asc' }
      },
      sets: {
        include: { exercise: true },
        orderBy: { setNumber: 'asc' }
      }
    },
    orderBy: { date: "desc" }
  });
}

export async function finishWorkout(workoutId: string) {
  const userId = await getSessionUserId();
  await prisma.workout.updateMany({
    where: { id: workoutId, userId },
    data: { endTime: new Date() }
  });
  revalidatePath("/");
  revalidatePath("/workouts");
  revalidatePath("/today");
}

export async function addExerciseToWorkout(workoutId: string, exerciseId: string) {
  await getSessionUserId();
  
  const existing = await prisma.workoutExercise.findUnique({
    where: {
      workoutId_exerciseId: {
        workoutId,
        exerciseId
      }
    }
  });

  if (!existing) {
    await prisma.workoutExercise.create({
      data: {
        workoutId,
        exerciseId
      }
    });
  }
}

export async function addSetToWorkout(workoutId: string, exerciseId: string, setNumber: number, weight: number, reps: number, isDropSet: boolean = false) {
  await getSessionUserId(); // just ensure auth
  const newSet = await prisma.set.create({
    data: {
      workoutId,
      exerciseId,
      setNumber,
      weight,
      reps,
      isDropSet
    }
  });
  
  // Ensure the WorkoutExercise link exists just in case
  await addExerciseToWorkout(workoutId, exerciseId);
  
  return newSet;
}

export async function getPreviousSession(exerciseId: string) {
  const userId = await getSessionUserId();
  // Find the most recent workout where this exercise was performed
  const previousSets = await prisma.set.findMany({
    where: { 
      exerciseId,
      workout: {
        userId
      }
    },
    orderBy: {
      workout: { date: "desc" }
    },
    take: 5 // get up to 5 sets from the last time
  });
  
  if (previousSets.length === 0) return null;
  
  // Only keep the ones from the same workout (the most recent one)
  const mostRecentWorkoutId = previousSets[0].workoutId;
  return previousSets.filter(s => s.workoutId === mostRecentWorkoutId).sort((a, b) => a.setNumber - b.setNumber);
}

export async function getExerciseHistory(exerciseId: string) {
  const userId = await getSessionUserId();
  
  const sets = await prisma.set.findMany({
    where: {
      exerciseId,
      workout: {
        userId
      }
    },
    include: {
      workout: true
    },
    orderBy: {
      workout: {
        date: "desc"
      }
    }
  });

  // Group by workout
  const history = sets.reduce((acc, set) => {
    const dateStr = set.workout.date.toISOString();
    if (!acc[dateStr]) {
      acc[dateStr] = {
        workoutId: set.workout.id,
        date: set.workout.date,
        sets: []
      };
    }
    acc[dateStr].sets.push({
      id: set.id,
      setNumber: set.setNumber,
      weight: set.weight,
      reps: set.reps
    });
    return acc;
  }, {} as Record<string, any>);

  // Sort sets within each workout by setNumber
  const sortedHistory = Object.values(history).map((workout: any) => {
    workout.sets.sort((a: any, b: any) => a.setNumber - b.setNumber);
    return workout;
  });

  return sortedHistory.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function deleteExercise(exerciseId: string) {
  const userId = await getSessionUserId();
  
  await prisma.exercise.deleteMany({
    where: {
      id: exerciseId,
      userId
    }
  });
}

export async function renameExercise(exerciseId: string, newName: string) {
  const userId = await getSessionUserId();
  
  await prisma.exercise.updateMany({
    where: {
      id: exerciseId,
      userId
    },
    data: {
      name: newName
    }
  });
}

export async function getTodaysWorkouts(startIso?: string, endIso?: string) {
  const userId = await getSessionUserId();
  
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (startIso && endIso) {
    today = new Date(startIso);
    tomorrow = new Date(endIso);
  }

  return prisma.workout.findMany({
    where: { 
      userId,
      date: {
        gte: today,
        lt: tomorrow,
      }
    },
    include: {
      sets: {
        include: { exercise: true },
        orderBy: { setNumber: 'asc' }
      }
    },
    orderBy: { date: "desc" }
  });
}

export async function deleteTodaysExerciseSets(exerciseId: string) {
  const userId = await getSessionUserId();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.set.deleteMany({
    where: {
      exerciseId,
      workout: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        }
      }
    }
  });

  await prisma.workoutExercise.deleteMany({
    where: {
      exerciseId,
      workout: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        }
      }
    }
  });
}

export async function updateSet(setId: string, weight: number, reps: number) {
  await getSessionUserId(); // ensure auth
  
  await prisma.set.update({
    where: { id: setId },
    data: { weight, reps }
  });
}

export async function deleteSet(setId: string) {
  await getSessionUserId(); // ensure auth
  await prisma.set.delete({
    where: { id: setId }
  });
}

export async function removeExerciseFromWorkout(workoutId: string, exerciseId: string) {
  const userId = await getSessionUserId();

  const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
  if (!workout || workout.userId !== userId) return;

  await prisma.workoutExercise.deleteMany({
    where: { workoutId, exerciseId }
  });

  await prisma.set.deleteMany({
    where: { workoutId, exerciseId }
  });
}

export async function logBodyMetrics(dateIso: string, metrics: {
  weight?: number;
  bodyFatPercent?: number;
}) {
  const userId = await getSessionUserId();
  const date = new Date(dateIso);
  date.setHours(0, 0, 0, 0); // Normalize to start of day

  // Check if a metric entry already exists for this exact date
  const existing = await prisma.bodyMetric.findFirst({
    where: {
      userId,
      date,
    }
  });

  if (existing) {
    return prisma.bodyMetric.update({
      where: { id: existing.id },
      data: metrics
    });
  }

  return prisma.bodyMetric.create({
    data: {
      userId,
      date,
      ...metrics
    }
  });
}

export async function getBodyMetrics() {
  const userId = await getSessionUserId();
  
  return prisma.bodyMetric.findMany({
    where: { userId },
    orderBy: { date: 'asc' } // Oldest to newest for charting
  });
}

export async function deleteBodyMetrics(id: string) {
  const userId = await getSessionUserId();
  
  const metric = await prisma.bodyMetric.findUnique({
    where: { id }
  });

  if (!metric || metric.userId !== userId) {
    throw new Error("Not authorized or metric not found");
  }

  await prisma.bodyMetric.delete({
    where: { id }
  });
}

// ----------------------
// TEMPLATES
// ----------------------

export async function getTemplates() {
  const userId = await getSessionUserId();
  
  return prisma.template.findMany({
    where: { userId },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createTemplate(name: string, exerciseIds: string[]) {
  const userId = await getSessionUserId();
  
  const template = await prisma.template.create({
    data: {
      userId,
      name,
      exercises: {
        create: exerciseIds.map((id, index) => ({
          exerciseId: id,
          order: index
        }))
      }
    }
  });
  revalidatePath("/routines");
  return template;
}

export async function updateTemplate(id: string, name: string, exerciseIds: string[]) {
  const userId = await getSessionUserId();
  
  const template = await prisma.template.findUnique({
    where: { id }
  });
  if (!template || template.userId !== userId) {
    throw new Error("Not authorized or template not found");
  }

  // Delete existing relationships
  await prisma.templateExercise.deleteMany({
    where: { templateId: id }
  });

  // Update name and create new relationships
  const updated = await prisma.template.update({
    where: { id },
    data: {
      name,
      exercises: {
        create: exerciseIds.map((exId, index) => ({
          exerciseId: exId,
          order: index
        }))
      }
    }
  });

  revalidatePath("/routines");
  return updated;
}

export async function deleteTemplate(id: string) {
  const userId = await getSessionUserId();
  
  const template = await prisma.template.findUnique({
    where: { id }
  });
  if (!template || template.userId !== userId) {
    throw new Error("Not authorized or template not found");
  }

  await prisma.template.delete({
    where: { id }
  });
  revalidatePath("/routines");
}

export async function startWorkoutFromTemplate(templateId: string) {
  const userId = await getSessionUserId();
  
  // Finish any lingering active workouts first
  await prisma.workout.updateMany({
    where: { userId, endTime: null },
    data: { endTime: new Date() }
  });

  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: { exercises: { orderBy: { order: 'asc' } } }
  });

  if (!template || template.userId !== userId) throw new Error("Template not found");

  const workout = await prisma.workout.create({
    data: {
      userId,
      date: new Date(),
      workoutExercises: {
        create: template.exercises.map(te => ({
          exerciseId: te.exerciseId,
        }))
      }
    }
  });
  
  revalidatePath("/");
  revalidatePath("/workouts");
  revalidatePath("/today");
  return workout;
}
