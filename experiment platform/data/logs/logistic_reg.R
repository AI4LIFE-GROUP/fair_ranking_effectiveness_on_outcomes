install.packages("ISLR", dependencies = TRUE)
library(ISLR)

install.packages("ggplot.multistats")
install.packages("ggplot2")
library(ggplot2)
library(ggplot.multistats)
setwd("C:\\Users\\Tom\\Documents\\R\\wd")
home = read.csv("homerepairs.csv")

summary(home)
glm.fit <- glm(formula = action ~ furniture_assembly_xp + home_repairs_xp + isMale , family = binomial, data = home)
summary(glm.fit)
glm.fit
sum(home$action)
