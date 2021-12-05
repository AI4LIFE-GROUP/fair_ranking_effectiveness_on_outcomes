setwd("C:\\Users\\tomsu\\Desktop\\fairnesstransparency\\data\\logs")
install.packages("glm2")
install.packages("lmtest")
install.packages("dummies")
install.packages("multcomp")
library("glm2")
library("lmtest")
library("dummies")
library("multcomp")
assembly_random = read.csv("furnitureassembly_random.csv")
assembly_ordered = read.csv("furnitureassembly_ordered.csv")

model_random_full <- glm(action ~ rank + furniture_assembly_xp + home_repairs_xp + isFemale, family ="binomial", data = assembly_random)
summary(model_random_full)

model_2 <- glm(action ~ rank + furniture_assembly_xp + home_repairs_xp, family ="binomial", data = assembly_random)
summary(model_2)
##H0 = model_2 is better than model_random full
# p> 0.05 => H0 is true
anova(model_random_full,model_2,test = "Chisq")
#=> model_2 is better

model_3 <- glm(action ~ rank + furniture_assembly_xp, family ="binomial", data = assembly_random)
summary(model_3)
##H0 = model_3 is better than model_2
# p> 0.05 => H0 is true
anova(model_2,model_3,test = "Chisq")
# p < 0.05 =>"H1" model_3 is not better