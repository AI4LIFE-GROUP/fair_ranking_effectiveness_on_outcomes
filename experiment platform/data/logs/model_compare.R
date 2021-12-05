setwd("C:\\Users\\tomsu\\Desktop\\fairnesstransparency\\data\\logs")
install.packages("glm2")
install.packages("lmtest")
install.packages("dummies")
install.packages("multcomp")
library("glm2")
library("lmtest")
library("dummies")
library("multcomp")
moving_assistance_random = read.csv("moving_assistance_random_first_selections.csv")
event_staffing_random = read.csv("event_staffing.csv")
shopping_random = read.csv("shopping.csv")
event_staffing_sorted = read.csv("event_staffing_sorted.csv")
taskrabbi = read.csv("taskRabbit_all_tasks_4_choices.csv")
####the two models to compare############

model_task_rabbit <- glm(action ~ rank + positive_reviews + reliability + tasks_completed + isFemale, family ="binomial", data=taskrabbi)

model_moving_assistance_random <- glm(action ~ rank + positive_reviews + reliability + tasks_completed + isFemale, family ="binomial", data=moving_assistance_random)
model_event_staffing_random <- glm(action ~ rank + positive_reviews + reliability + tasks_completed + isFemale, family ="binomial", data=event_staffing_random)
model_shopping_random <- glm(action ~ rank + positive_reviews + reliability + tasks_completed + isFemale, family ="binomial", data=shopping_random)

summary(model_task_rabbit)

summary(model_moving_assistance_random)
summary(model_event_staffing_random)
summary(model_shopping_random)

model_event_staffing_sorted <- glm(action ~ rank + positive_reviews + reliability + tasks_completed + isFemale, family ="binomial", data=event_staffing_sorted)

summary(model_event_staffing_sorted)

########################################


#First model is the combination of the two models above and the effect between group affiliation and features#
model_randord <- glm(action ~ rank * isRandom + furniture_assembly_xp * isRandom + home_repairs_xp * isRandom, family ="binomial", data=assembly_orderd_and_random)
#Second model as if there would be no effect of the group affiliation#
model_randord_noint <- glm(action ~ rank + furniture_assembly_xp + home_repairs_xp + isRandom, family ="binomial", data=assembly_orderd_and_random)
summary(model_randord)

#Likelihood ratio test
#H0: "all coefficients of equal 0"
#H1: "at least one group affiliation effect coefficient is not 0" ( true if p<0.01 )
anova(model_randord_noint,model_randord, test="Chisq")

#Pairwise comparison of group affiliations slopes for each feature"
glht_mod <- glht(model_randord, linfct = c(  "isRandom:furniture_assembly_xp = 0"
                                       , "isRandom:home_repairs_xp = 0",
                                        "rank:isRandom = 0"))
summary(glht_mod)

#H0 = "all pairwise slope comparisons are 0"
summary(glht_mod, Chisqtest())
