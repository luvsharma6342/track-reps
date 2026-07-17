"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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
  const workout = await prisma.workout.create({
    data: {
      userId,
      date: new Date(),
    }
  });
  return workout;
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
}
