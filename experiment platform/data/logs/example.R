setwd("C:\\Users\\tomsu\\Desktop\\fairnesstransparency\\data\\logs")
install.packages("glm2")
install.packages("lmtest")
install.packages("dummies")
install.packages("multcomp")
library("glm2")
library("lmtest")
library("dummies")
library("multcomp")
moving_assistance_random = read.csv("moving_assistance.csv")

####the two models to compare############
#model_random <- glm(action ~ rank + furniture_assembly_xp + home_repairs_xp, family ="binomial", data=assembly_random)
#model_ordered <- glm(action ~ rank + furniture_assembly_xp + home_repairs_xp, family ="binomial", data=assembly_ordered)

#summary(model_random)
#summary(model_ordered)
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
