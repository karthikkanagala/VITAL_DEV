def generate_actions(scores: dict, inputs: dict) -> list[str]:
    actions = []

    heart = scores["heartRisk"]
    diabetes = scores["diabetesRisk"]
    obesity = scores["obesityRisk"]
    bmi = inputs.get("BMI", 0)
    any_high = max(heart, diabetes, obesity) >= 45

    if inputs.get("smoking_status", 0) == 2 and heart >= 45:
        actions.append(
            "Quit smoking \u2014 reduces heart risk by up to 22% within 1 year"
        )

    if inputs.get("sugar_intake", 0) == 2 and diabetes >= 45:
        actions.append(
            "Cut high sugar intake \u2014 single highest impact change for diabetes risk"
        )

    if inputs.get("physical_activity", 0) <= 1 and any_high:
        actions.append(
            "Add 30 min daily walking \u2014 reduces all three risk scores simultaneously"
        )

    if bmi >= 27.5 and obesity >= 70:
        actions.append(
            "Target 5-7% weight reduction \u2014 clinically proven to reverse pre-diabetes"
        )

    if inputs.get("sleep_hours", 7) < 6:
        actions.append(
            "Improve sleep to 7-8 hours \u2014 poor sleep elevates cortisol and risk"
        )

    if inputs.get("stress_level", 0) == 2 and heart >= 45:
        actions.append(
            "Practice daily stress management \u2014 chronic stress elevates heart risk by 27%"
        )

    if (
        inputs.get("family_history_heart", 0) == 1
        or inputs.get("family_history_diab", 0) == 1
    ):
        actions.append(
            "Schedule annual health screening \u2014 family history doubles baseline risk"
        )

    if not actions:
        actions.append(
            "Maintain your current healthy lifestyle and schedule regular check-ups"
        )

    return actions[:3]
