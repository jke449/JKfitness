const STORAGE_KEY = 'upper-lower-tracker-v2';
let IMAGE_MAP = {};

// Load automatic image map generated from the PDF (if present)
fetch('/images/images_map.json')
  .then((r) => r.json())
  .then((m) => {
    IMAGE_MAP = m || {};
    // re-render in case map provides images for items with empty image field
    renderWorkouts();
  })
  .catch(() => {
    IMAGE_MAP = {};
  });

const initialWorkouts = [
  {
    id: 'upper-1',
    title: 'Upper Body 1',
    started: false,
    completed: false,
    exercises: [
        { name: 'Low Incline Dumbbell Press', targetSets: 3, reps: '8-10', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Pull-Ups', targetSets: 3, reps: '6-12', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Dumbbell Lateral Raises', targetSets: 3, reps: '15-20', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Dumbbell Chest Supported Row', targetSets: 3, reps: '10-12', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Banded Push-Ups', targetSets: 3, reps: '10+', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' }
    ]
  },
  {
    id: 'lower-1',
    title: 'Lower Body 1',
    started: false,
    completed: false,
    exercises: [
        { name: 'Barbell Back Squat', targetSets: 3, reps: '8-10', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Dumbbell Romanian Deadlift', targetSets: 3, reps: '10-12', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Seated Leg Extensions', targetSets: 3, reps: '10-15', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Standing Weighted Calf Raises', targetSets: 3, reps: '10-15', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Palloff Press', targetSets: 2, reps: '5/side', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' }
    ]
  },
  {
    id: 'upper-2',
    title: 'Upper Body 2',
    started: false,
    completed: false,
    exercises: [
        { name: 'Barbell Bench Press', targetSets: 3, reps: '8-10', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Seated Cable Row', targetSets: 3, reps: '8-10', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Standing Barbell Overhead Press', targetSets: 3, reps: '6-8', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Standing Mid-Chest Cable Fly', targetSets: 3, reps: '10-15', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Behind Body Cable Curls', targetSets: 3, reps: '10-12', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Standing Face Pulls', targetSets: 3, reps: '10', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' }
    ]
  },
  {
    id: 'lower-2',
    title: 'Lower Body 2',
    started: false,
    completed: false,
    exercises: [
        { name: 'Barbell Deadlift', targetSets: 3, reps: '6-8', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Front Foot Elevated Reverse Lunges', targetSets: 3, reps: '8-10/leg', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Seated Leg Curls', targetSets: 3, reps: '10-15', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Seated Weighted Calf Raises', targetSets: 3, reps: '10-15', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' },
        { name: 'Bird Dog', targetSets: 2, reps: '5/side', completed: false, setsDone: 0, repsDone: '', weight: '', notes: '', image: '' }
    ]
  }
];

let state = loadState();

const workoutList = document.getElementById('workoutList');
const completedCount = document.getElementById('completedCount');
const workoutCount = document.getElementById('workoutCount');
const lastSaved = document.getElementById('lastSaved');
const resetButton = document.getElementById('resetButton');

function cloneWorkout(workout) {
  return {
    ...workout,
    started: Boolean(workout.started),
    completed: Boolean(workout.completed),
    exercises: (workout.exercises || []).map((exercise) => ({ ...exercise }))
  };
}

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

    return {
      workouts: parsed.workouts.map((workout, index) => {
        const fallback = initialWorkouts[index] || initialWorkouts[0];
        const normalizedExercises = (workout.exercises || []).map((exercise, exerciseIndex) => {
          const fallbackExercise = (fallback.exercises || [])[exerciseIndex] || {};
          return {
            ...fallbackExercise,
            ...exercise,
            completed: Boolean(exercise.completed),
            setsDone: Number(exercise.setsDone || 0),
            repsDone: exercise.repsDone ?? '',
            weight: exercise.weight ?? '',
            notes: exercise.notes ?? '',
            image: exercise.image ?? fallbackExercise.image ?? ''
          };
        });

        return {
          ...cloneWorkout(fallback),
          ...workout,
          id: workout.id || fallback.id,
          title: workout.title || fallback.title,
          started: Boolean(workout.started),
          completed: Boolean(workout.completed),
          exercises: normalizedExercises
        };
      })
    };
  } catch (error) {
    console.warn('Unable to load saved progress', error);
    return { workouts: initialWorkouts.map(cloneWorkout) };
  }
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
  const startedWorkouts = state.workouts.filter((workout) => workout.started).length;
  return { exerciseCount, completedExercises, startedWorkouts };
}

function renderSummary() {
  const summary = getSummary();
  completedCount.textContent = `${summary.completedExercises} / ${summary.exerciseCount}`;
  workoutCount.textContent = `${summary.startedWorkouts} / ${state.workouts.length}`;
}

function renderWorkouts() {
  workoutList.innerHTML = state.workouts
    .map((workout, workoutIndex) => {
      const workoutStatus = workout.completed
        ? 'Completed'
        : workout.started
          ? 'In progress'
          : 'Not started';

      const exercisesMarkup = workout.exercises
        .map((exercise, exerciseIndex) => {
          const completedClass = exercise.completed ? 'completed' : '';
          const activeClass = workout.started ? 'active' : '';
          const resolvedImage = exercise.image || IMAGE_MAP[exercise.name] || '';
          const mediaMarkup = resolvedImage
            ? `<img src="${resolvedImage}" class="exercise-image" alt="${exercise.name}" />`
            : `<svg class="exercise-image placeholder" viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                 <rect width="64" height="48" rx="6" fill="#0e1b2f" />
                 <g fill="#67a4ff" opacity="0.12"><rect x="6" y="8" width="52" height="32" rx="4"/></g>
                 <circle cx="20" cy="20" r="6" fill="#67a4ff" opacity="0.18" />
               </svg>`;

          return `
            <article class="exercise-card ${completedClass} ${activeClass}">
              <div class="exercise-top">
                ${mediaMarkup}
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
                <span class="exercise-hint">Recommended: ${exercise.targetSets} sets × ${exercise.reps} reps</span>
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
                  <span>Weight used</span>
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
              <div class="controls secondary-controls">
                <label class="field full-width">
                  <span>Reps done</span>
                  <input
                    type="text"
                    data-workout="${workoutIndex}"
                    data-exercise="${exerciseIndex}"
                    data-field="repsDone"
                    placeholder="e.g. 8, 8, 7"
                    value="${exercise.repsDone}"
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
        <section class="workout-card ${workout.started ? 'active' : ''}">
          <div class="workout-header">
            <div>
              <h2 class="workout-title">${workout.title}</h2>
              <span class="status-pill">${workoutStatus}</span>
            </div>
            <div class="action-row">
              <button class="secondary-button" type="button" data-workout="${workoutIndex}" data-action="toggle-start">
                ${workout.started ? 'Resume workout' : 'Start workout'}
              </button>
              <button class="secondary-button" type="button" data-workout="${workoutIndex}" data-action="finish-workout" ${workout.completed ? 'disabled' : ''}>
                ${workout.completed ? 'Completed' : 'Complete workout'}
              </button>
            </div>
          </div>
          <p class="helper-text"><strong>Tip:</strong> Start the workout, complete the exercises as you go, and enter the weight and reps you used. Your progress is saved automatically in this browser.</p>
          <div class="exercise-list">${exercisesMarkup}</div>
        </section>
      `;
    })
    .join('');
}

function updateWorkoutStatus(workout) {
  workout.completed = workout.exercises.every((exercise) => exercise.completed);
  workout.started = workout.started || workout.exercises.some((exercise) => exercise.completed || exercise.setsDone > 0 || exercise.weight || exercise.notes || exercise.repsDone);
}

function updateFromInput(target) {
  const workoutIndex = Number(target.dataset.workout);
  const exerciseIndex = Number(target.dataset.exercise);
  const field = target.dataset.field;

  if (Number.isNaN(workoutIndex) || Number.isNaN(exerciseIndex)) {
    return;
  }

  const workout = state.workouts[workoutIndex];
  const exercise = workout.exercises[exerciseIndex];

  if (field === 'completed') {
    exercise.completed = target.checked;
    if (exercise.completed) {
      exercise.setsDone = Math.max(exercise.setsDone, 1);
    }
  } else if (field === 'setsDone') {
    exercise.setsDone = Math.min(Math.max(Number(target.value || 0), 0), exercise.targetSets);
    exercise.completed = exercise.setsDone >= exercise.targetSets || exercise.completed;
  } else if (field === 'weight') {
    exercise.weight = target.value;
  } else if (field === 'repsDone') {
    exercise.repsDone = target.value;
  } else if (field === 'notes') {
    exercise.notes = target.value;
  }

  updateWorkoutStatus(workout);
  saveState();
  renderSummary();
  renderWorkouts();
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

workoutList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const workoutIndex = Number(button.dataset.workout);
  const workout = state.workouts[workoutIndex];
  const action = button.dataset.action;

  if (action === 'toggle-start') {
    workout.started = true;
    saveState();
    renderSummary();
    renderWorkouts();
  }

  if (action === 'finish-workout') {
    workout.started = true;
    workout.completed = true;
    workout.exercises.forEach((exercise) => {
      exercise.completed = true;
      exercise.setsDone = Math.max(exercise.setsDone, exercise.targetSets);
    });
    saveState();
    renderSummary();
    renderWorkouts();
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
