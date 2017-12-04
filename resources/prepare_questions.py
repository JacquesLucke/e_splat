import json

source = [
    ["During an average day, how many hours do you spend with other people face-to-face?",
        ["Less than 1 hour", "1-2 hours", "2-3 hours", "3-4 hours", "4-6 hours", "7+ hours"]],
    ["During an average day, how many people do you socialise with face-to-face?",
        ["5 and fewer people", "6-10 people", "11-15 people", "16-20 people", "21-25 people", "26+ people"]],
    ["During a day, how much time do you spend on social media?",
        ["Less than 1 hour", "1-3 hours", "3-5 hours", "5-7 hours", "7-9 hours", "9-11 hours", "more than 11 hours"]],
    ["While you are with people face to face, how often are you on social media?",
        ["Every time I am with someone, I will use social media.",
         "Most of the time when I am with someone I use social media.",
         "Some of the time I am with someone I use social media.",
         "Rarely when I am with someone I will use social media.",
         "Never when I am with someone will I use social media"]],
    ["During one day, how long do you spend online?",
        ["Less than 1 hour", "1-3 hours", "3-5 hours", "5-7 hours", "7-9 hours", "9-11 hours", "More than 11 hours"]],
    ["Rate how much do you want to check Facebook (or another form of social media) currently?",
        ["Extremely", "Quite a bit", "Moderately", "A little", "Not at all"]]
]

data = []
for question, answers in source:
    data.append({"question" : question, "answers" : answers, "multiple" : False})

jsonData = json.dumps(data, sort_keys = True, indent = 2)

with open("tmp.json", "w") as f:
    f.write(jsonData)
