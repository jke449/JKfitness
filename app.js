const STORAGE_KEY = 'bws-upper-lower-tracker-v1';

const initialWorkouts = [
  {
    id: 'upper-1',
    title: 'Upper Body 1',
    exercises: [
      { name: 'Low Incline Dumbbell Press', targetSets: 3, reps: '8-10', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Pull-Ups', targetSets: 3, reps: '6-12', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Dumbbell Lateral Raises', targetSets: 3, reps: '15-20', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Dumbbell Chest Supported Row', targetSets: 3, reps: '10-12', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Banded Push-Ups', targetSets: 3, reps: '10+', completed: false, setsDone: 0, weight: '', notes: '' }
    ]
  },
  {
    id: 'lower-1',
    title: 'Lower Body 1',
    exercises: [
      { name: 'Barbell Back Squat', targetSets: 3, reps: '8-10', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Dumbbell Romanian Deadlift', targetSets: 3, reps: '10-12', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Seated Leg Extensions', targetSets: 3, reps: '10-15', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Standing Weighted Calf Raises', targetSets: 3, reps: '10-15', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Palloff Press', targetSets: 2, reps: '5/side', completed: false, setsDone: 0, weight: '', notes: '' }
    ]
  },
  {
    id: 'upper-2',
    title: 'Upper Body 2',
    exercises: [
      { name: 'Barbell Bench Press', targetSets: 3, reps: '8-10', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Seated Cable Row', targetSets: 3, reps: '8-10', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Standing Barbell Overhead Press', targetSets: 3, reps: '6-8', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Standing Mid-Chest Cable Fly', targetSets: 3, reps: '10-15', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Behind Body Cable Curls', targetSets: 3, reps: '10-12', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Standing Face Pulls', targetSets: 3, reps: '10', completed: false, setsDone: 0, weight: '', notes: '' }
    ]
  },
  {
    id: 'lower-2',
    title: 'Lower Body 2',
    exercises: [
      { name: 'Barbell Deadlift', targetSets: 3, reps: '6-8', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Front Foot Elevated Reverse Lunges', targetSets: 3, reps: '8-10/leg', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Seated Leg Curls', targetSets: 3, reps: '10-15', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Seated Weighted Calf Raises', targetSets: 3, reps: '10-15', completed: false, setsDone: 0, weight: '', notes: '' },
      { name: 'Bird Dog', targetSets: 2, reps: '5/side', completed: false, setsDone: 0, weight: '', notes: '' }
    ]
  }
];

let state = loadState();

const workoutList = document.getElementById('workoutList');
const completedCount = document.getElementById('completedCount');
const workoutCount = document.getElementById('workoutCount');
const lastSaved = document.getElementById('lastSaved');
const resetButton = document.getElementById('resetButton');

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { workouts: initialWorkouts.map(cloneWorkout) };
    }

    const parsed = JSON.parse(stored);
    if (!parsed.workouts) {
      return { workouts: initialWorkouts.map(cloneWorkout) };
    }

    return { workouts: parsed.workouts };
  } catch (error) {
    console.warn('Unable to load saved progress', error);
    return { workouts: initialWorkouts.map(cloneWorkout) };
  }
}

function cloneWorkout(workout) {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise) => ({ ...exercise }))
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const now = new Date();
  lastSaved.textContent = now.toLocaleString();
}

function getSummary() {
  const exerciseCount = state.workouts.reduce((total, workout) => total + workout.exercises.length, 0);
  const completedExercises = state.workouts.reduce(
    (total, workout) => total + workout.exercises.filter((exercise) => exercise.completed).length,
    0
  );
  const completedWorkouts = state.workouts.filter((workout) => workout.exercises.every((exercise) => exercise.completed)).length;
  return { exerciseCount, completedExercises, completedWorkouts };
}

function renderSummary() {
  const summary = getSummary();
  completedCount.textContent = `${summary.completedExercises} / ${summary.exerciseCount}`;
  workoutCount.textContent = `${summary.completedWorkouts} / ${state.workouts.length}`;
}

function renderWorkouts() {
  workoutList.innerHTML = state.workouts
    .map((workout, workoutIndex) => {
      const exercisesMarkup = workout.exercises
        .map((exercise, exerciseIndex) => {
          const completedClass = exercise.completed ? 'completed' : '';
          return `
            <article class="exercise-card ${completedClass}">
              <div class="exercise-top">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    data-workout="${workoutIndex}"
                    data-exercise="${exerciseIndex}"
                    data-field="completed"
                    ${exercise.completed ? 'checked' : ''}
                  />
                  <span>${exercise.name}</span>
                </label>
                <span class="exercise-hint">${exercise.targetSets} sets · ${exercise.reps}</span>
              </div>
              <div class="controls">
                <label class="field">
                  <span>Sets done</span>
                  <input
                    type="number"
                    min="0"
                    max="${exercise.targetSets}"
                    data-workout="${workoutIndex}"
                    data-exercise="${exerciseIndex}"
                    data-field="setsDone"
                    value="${exercise.setsDone}"
                  />
                </label>
                <label class="field">
                  <span>Weight / notes</span>
                  <input
                    type="text"
                    data-workout="${workoutIndex}"
                    data-exercise="${exerciseIndex}"
                    data-field="weight"
                    placeholder="e.g. 45 lb"
                    value="${exercise.weight}"
                  />
                </label>
              </div>
              <label class="field">
                <span>Notes</span>
                <textarea
                  data-workout="${workoutIndex}"
                  data-exercise="${exerciseIndex}"
                  data-field="notes"
                  placeholder="How did it feel?"
                >${exercise.notes}</textarea>
              </label>
            </article>
          `;
        })
        .join('');

      return `
        <section class="workout-card">
          <h2 class="workout-title">${workout.title}</h2>
          <div class="exercise-list">${exercisesMarkup}</div>
        </section>
      `;
    })
    .join('');
}

function updateFromInput(target) {
  const workoutIndex = Number(target.dataset.workout);
  const exerciseIndex = Number(target.dataset.exercise);
  const field = target.dataset.field;

  if (Number.isNaN(workoutIndex) || Number.isNaN(exerciseIndex)) {
    return;
  }

  const exercise = state.workouts[workoutIndex].exercises[exerciseIndex];

  if (field === 'completed') {
    exercise.completed = target.checked;
    if (exercise.completed) {
      exercise.setsDone = Math.max(exercise.setsDone, 1);
    }
  } else if (field === 'setsDone') {
    exercise.setsDone = Number(target.value || 0);
    if (exercise.setsDone >= 1) {
      exercise.completed = true;
    } else {
      exercise.completed = false;
    }
  } else if (field === 'weight') {
    exercise.weight = target.value;
  } else if (field === 'notes') {
    exercise.notes = target.value;
  }

  saveState();
  renderSummary();
  if (field === 'completed' || field === 'setsDone') {
    renderWorkouts();
  }
}

workoutList.addEventListener('input', (event) => {
  const target = event.target;
  if (target.matches('input, textarea')) {
    updateFromInput(target);
  }
});

workoutList.addEventListener('change', (event) => {
  const target = event.target;
  if (target.matches('input, textarea')) {
    updateFromInput(target);
  }
});

resetButton.addEventListener('click', () => {
  const confirmed = window.confirm('Clear all saved workout progress?');
  if (!confirmed) {
    return;
  }

  state = { workouts: initialWorkouts.map(cloneWorkout) };
  saveState();
  renderSummary();
  renderWorkouts();
});

renderSummary();
renderWorkouts();
if (lastSaved.textContent === 'Not yet') {
  lastSaved.textContent = 'Saved locally';
}
