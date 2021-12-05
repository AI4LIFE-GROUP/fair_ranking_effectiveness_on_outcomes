import random
import json


def assign_xp_and_score_ranks(data, total=False):
    data = sorted(data, key=lambda v: v['score'], reverse=True)
    rank = 1
    for x in data:
        x["score_rank"] = rank
        rank = rank + 1
    data = sorted(data, key=lambda v: v['totalExp'], reverse=True)
    rank = 1
    for y in data:
        y["xp_ranking"] = rank
        rank = rank + 1
    if total:
        rank = 1
        random.shuffle(data)
        for z in data:
            z["totalRank"] = rank
            rank = rank + 1



xp_max = 10
xp_min = 1
equal = 0
femaleDom = 0
maleDom = 0
size = 10
k = 0
while (equal < size) or (femaleDom < size) or (maleDom < size):
    totalData = []
    k = k + 1
    candidates = {}
    candidates["id"] = k
    sum = 0
    id = 0
    gender = "f"
    for j in range(0, 2):
        data = []
        for i in range(0, 10):
            candidate = {}
            tag1 = round(random.uniform(xp_min, xp_max), 1)
            tag2 = round(random.uniform(xp_min, 10.0), 1)
            total = tag1 + tag2
            sum = sum + total
            candidate["id"] = id
            id = id + 1
            candidate["tag1"] = tag1
            candidate["tag2"] = tag2
            candidate["totalExp"] = round(total, 1)
            candidate["name"] = "Candidate " + str(id)
            candidate["gender"] = gender
            candidate["score"] = 10.0 - (i * 0.1)
            data.append(candidate)
        sum = round((sum / 10.0), 1)
        assign_xp_and_score_ranks(data)
        for cand in data:
            totalData.append(cand)
        print("avg: " + gender + ", " + str(sum))
        if j == 0:
            female_avg = sum
            candidates["data"] = {}
            candidates["data"]["female"] = data
            gender = "m"
        else:
            male_avg = sum
            candidates["data"]["male"] = data
            gender = "f"
    assign_xp_and_score_ranks(totalData, total=True)
    candidates["totaldata"] = totalData
    candidates["female average xp"] = female_avg
    candidates["male average xp"] = male_avg
    filename = str(k) + "_data.json"
    if (male_avg == 13.7) and (female_avg == 12.1) and (femaleDom < size):
        femaleDom = femaleDom + 1
        with open("maleDominantXP\\" + filename, 'w') as fp:
            json.dump(candidates, fp)
