/**
 * Full form validation — validates all 17 required fields.
 * Accepts the API payload shape (payload field names, NOT form state keys).
 * @param {object} inputs  payload object
 * @returns {{ isValid: boolean, errors: object }}
 */
export function validateForm(inputs) {
  const errors = {};

  // Age
  if (!inputs.age || inputs.age === '')
    errors.age = 'Age is required';
  else if (Number(inputs.age) < 10 || Number(inputs.age) > 80)
    errors.age = 'Age must be between 10 and 80';

  // Sex
  if (inputs.sex === '' || inputs.sex === null || inputs.sex === undefined)
    errors.sex = 'Please select your sex';

  // Height
  if (!inputs.height_cm || inputs.height_cm === '')
    errors.height_cm = 'Height is required';
  else if (Number(inputs.height_cm) < 100 || Number(inputs.height_cm) > 250)
    errors.height_cm = 'Height: 100 to 250 cm';

  // Weight
  if (!inputs.weight_kg || inputs.weight_kg === '')
    errors.weight_kg = 'Weight is required';
  else if (Number(inputs.weight_kg) < 20 || Number(inputs.weight_kg) > 200)
    errors.weight_kg = 'Weight: 20 to 200 kg';

  // Waist
  if (!inputs.waist_cm || inputs.waist_cm === '')
    errors.waist_cm = 'Waist is required';
  else if (Number(inputs.waist_cm) < 40 || Number(inputs.waist_cm) > 200)
    errors.waist_cm = 'Waist: 40 to 200 cm';

  // Physical Activity
  if (inputs.physical_activity === '' || inputs.physical_activity === null || inputs.physical_activity === undefined)
    errors.physical_activity = 'Please select activity level';

  // Sleep Hours
  if (!inputs.sleep_hours || inputs.sleep_hours === '')
    errors.sleep_hours = 'Sleep hours is required';
  else if (Number(inputs.sleep_hours) < 1 || Number(inputs.sleep_hours) > 24)
    errors.sleep_hours = 'Sleep: 1 to 24 hours';

  // Stress Level
  if (inputs.stress_level === '' || inputs.stress_level === null || inputs.stress_level === undefined)
    errors.stress_level = 'Please select stress level';

  // Smoking Status
  if (inputs.smoking_status === '' || inputs.smoking_status === null || inputs.smoking_status === undefined)
    errors.smoking_status = 'Please select smoking status';

  // Fried Food
  if (inputs.fried_food === '' || inputs.fried_food === null || inputs.fried_food === undefined)
    errors.fried_food = 'Please select junk food level';

  // Sugar Intake
  if (inputs.sugar_intake === '' || inputs.sugar_intake === null || inputs.sugar_intake === undefined)
    errors.sugar_intake = 'Please select sugar intake';

  // Salt Intake
  if (inputs.salt_intake === '' || inputs.salt_intake === null || inputs.salt_intake === undefined)
    errors.salt_intake = 'Please select salt intake';

  // Water Intake
  if (inputs.water_intake === '' || inputs.water_intake === null || inputs.water_intake === undefined)
    errors.water_intake = 'Please select water intake';

  // Family History Heart
  if (inputs.family_history_heart === '' || inputs.family_history_heart === null || inputs.family_history_heart === undefined)
    errors.family_history_heart = 'Please answer this question';

  // Family History Diabetes
  if (inputs.family_history_diab === '' || inputs.family_history_diab === null || inputs.family_history_diab === undefined)
    errors.family_history_diab = 'Please answer this question';

  // Chest Discomfort
  if (inputs.chest_discomfort === '' || inputs.chest_discomfort === null || inputs.chest_discomfort === undefined)
    errors.chest_discomfort = 'Please select an option';

  // Excessive Thirst
  if (inputs.excessive_thirst === '' || inputs.excessive_thirst === null || inputs.excessive_thirst === undefined)
    errors.excessive_thirst = 'Please select an option';

  return { isValid: Object.keys(errors).length === 0, errors };
}
