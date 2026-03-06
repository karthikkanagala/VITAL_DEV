def apply_compounding(scores: dict, inputs: dict) -> dict:
    heart = scores["heartRisk"]
    diabetes = scores["diabetesRisk"]
    obesity = scores["obesityRisk"]

    alert = False
    message = ""

    # Rule 1: diabetes risk + high BMI → elevate heart
    if diabetes >= 45 and inputs.get("BMI", 0) >= 27.5:
        heart += 8
        alert = True
        message = "High BMI combined with diabetes risk elevates heart risk"

    # Rule 2: heart risk + current smoker → elevate heart
    if heart >= 50 and inputs.get("smoking_status", 0) == 2:
        heart += 10
        alert = True
        message = "Active smoking significantly amplifies heart risk"

    # Rule 3: obesity + diabetes → elevate diabetes
    if obesity >= 70 and diabetes >= 45:
        diabetes += 7
        alert = True
        message = "Obesity-diabetes combination detected \u2014 insulin resistance risk elevated"

    # Rule 4: triple risk
    if heart >= 45 and diabetes >= 45 and obesity >= 70:
        heart += 5
        diabetes += 5
        obesity += 5
        alert = True
        message = "Triple risk detected \u2014 immediate lifestyle intervention recommended"

    # Cap all scores at 95
    heart = min(heart, 95)
    diabetes = min(diabetes, 95)
    obesity = min(obesity, 95)

    return {
        "heartRisk": heart,
        "diabetesRisk": diabetes,
        "obesityRisk": obesity,
        "compoundingAlert": alert,
        "compoundingMessage": message,
    }
