library(skimr)
library(ez)
library(ggplot2)

#Bootstrapped confidence intervals
tboot <- function(x) {
	#95% bootstrapped confidence intervals of the means with 1000 samples.
	#Note that these will not be stable confidence intervals! If they differ across runs, don't be scared.
	n = length(x)
	boot.samples = matrix( sample(x,size=n*1000,replace=TRUE), 1000, n)
	boot.statistics = apply(boot.samples,1,mean)
	interval = c(ci1 = quantile(boot.statistics,0.025,names=FALSE),mean = mean(x),ci2 = quantile(boot.statistics,0.975,names=FALSE))
	return(interval)
}


#Experiment One

#We're relying on two files here:
#cleandemo.csv is my demographic data, and cleanrows.csv is the per-trial information.
#They are called "clean" because I've stripped out any potentially identifying information (ip address) and also I've eliminated duplicate rows and cleaned up any special characters (newlines, commas) in free text responses that would mess with our csv.

#Read in demographics data
demo <- read.csv("exp1/cleandemo.csv")

#Did they get the truncation-related questions correct?
demo$q10Correct <- demo$q10==3
demo$q11Correct <- demo$q11==4
demo$qBothCorrect <- demo$q10Correct & demo$q11Correct
#Did I code them as mentioning the axis truncation in their comments?
demo$noticedTruncation <- as.logical(demo$QUAL_noticed_truncation)

#What does our demographic data look like?
skim(demo)

#Do an inner join on data/demographic info.
data <- read.csv("exp1/cleanrows.csv")
mergedata <- merge(data,demo,by="id",)

#What does the full table look like?
skim(mergedata)

#Let's look for low performers on our engagement question and filter them out.
#I'm using a 3 sigma standard here.

participantPerformance <- with(mergedata,aggregate(correct ~ id,FUN=mean))
participantPerformance <- participantPerformance[order(participantPerformance$correct),]

blackList <- subset(participantPerformance,correct<(mean(participantPerformance$correct) - 3*sd(participantPerformance$correct)))$id

#analysisData is our main dataframe. Let's populate it with our rows.
analysisData <- subset(mergedata,!(id %in% blackList))

#Let's also trip out our training/calibration stimuli.
analysisData <- analysisData[is.na(analysisData$training),]

#Let's coerce some of our numerical factor levels to factors for our ANOVA.
analysisData$sizeF <- factor(analysisData$dataSize)
analysisData$truncationF <- factor(analysisData$truncationLevel)

#Run ANOVA.
model <- ezANOVA(data=analysisData, dv = .(qSeverity), wid= .(id), within = .(truncationF,visType,framing,sizeF), observed= .(noticedTruncation,qBothCorrect))

pairwise.t.test(analysisData$qSeverity,analysisData$truncationF,p.adjust.method="bonferroni")

pairwise.t.test(analysisData$qSeverity,analysisData$framing,p.adjust.method="bonferroni")


#Make plots

#How did the different vis types impact judgments?
exp1Designs <- with(analysisData, aggregate(qSeverity ~ truncationF*visType, FUN=tboot))

p <- ggplot(exp1Designs, aes(x=visType, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)", title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("Bar","Line"),name="Visualization Design") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5)) + theme(axis.text=element_text(size=18),
        axis.title=element_text(size=18), strip.text=element_text(size=24))


p

ggsave("exp1Designs.pdf", plot=last_plot(), device="pdf")

#What about the framings?

exp1Framings <- with(analysisData, aggregate(qSeverity ~ framing*visType, FUN=tboot))

p <- ggplot(exp1Framings, aes(x=framing, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)", title="Visualization Design") + scale_x_discrete(labels=c("Trend","Values"),name="Question Framing") + facet_grid(. ~ visType, labeller=labeller(visType=c(bar = "Bar",line = "Line"))) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5)) + theme(axis.text=element_text(size=18),
        axis.title=element_text(size=18), strip.text=element_text(size=24))

p

ggsave("exp1Frames.pdf", plot=last_plot(), device="pdf")

#And folks who noticed?

exp1Noticed <- with(analysisData, aggregate(qSeverity ~ noticedTruncation*truncationF, FUN=tboot))

p <- ggplot(exp1Noticed, aes(x=noticedTruncation, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)",title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("False","True"),name="Commented on Truncation") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=24,hjust=0.5)) + theme(axis.text=element_text(size=18),
        axis.title=element_text(size=18), strip.text=element_text(size=24))

p

ggsave("exp1Noticed.pdf", plot=last_plot(), device="pdf")

exp1Q10 <- with(analysisData, aggregate(qSeverity ~ q10Correct, FUN=tboot))

p <- ggplot(exp1Q10, aes(x=q10Correct, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)",title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("False","True"),name="Graphicity") + theme_bw() + theme(plot.title = element_text(size=24,hjust=0.5)) + theme(axis.text=element_text(size=18),
        axis.title=element_text(size=18), strip.text=element_text(size=24))

p

ggsave("exp1Q10.pdf", plot=last_plot(), device="pdf")

#Experiment Two


#Similar to the first experiment,:
#cleandemo2.csv is my demographic data, and cleanrows2.csv is the per-trial information.

#Read in demographics data
demo2 <- read.csv("exp2/cleandemo2.csv")

#Did they get the truncation-related questions correct?
demo2$q10Correct <- demo2$q10==3
demo2$q11Correct <- demo2$q11==4
demo2$qBothCorrect <- demo2$q10Correct & demo2$q11Correct
#Did I code them as mentioning the axis truncation in their comments?
demo2$noticedTruncation <- as.logical(demo2$QUAL_noticed_truncation)

#What does our demographic data look like?
skim(demo2)

#Do an inner join on data/demographic info.
data2 <- read.csv("exp2/cleanrows2.csv")
mergedata2 <- merge(data2,demo2,by="id")

#What does the full table look like?
skim(mergedata2)

#Let's look for low performers on our engagement question and filter them out.
#I'm using a 3 sigma standard here.

participantPerformance2 <- with(mergedata2,aggregate(correct ~ id,FUN=mean))
participantPerformance2 <- participantPerformance2[order(participantPerformance2$correct),]

blackList2 <- subset(participantPerformance2,correct<(mean(participantPerformance2$correct) - 3*sd(participantPerformance2$correct)))$id

#analysisData is our main dataframe. Let's populate it with our rows.
analysisData2 <- subset(mergedata2,!(id %in% blackList2))

#Let's also trip out our training/calibration stimuli.
analysisData2 <- analysisData2[is.na(analysisData2$training),]

#Let's coerce some of our numerical factor levels to factors for our ANOVA.
analysisData2$sizeF <- factor(analysisData2$dataSize)
analysisData2$truncationF <- factor(analysisData2$truncationLevel)

#The charts were identical when the truncation level was 0, so let's remove them from our ANOVA

#Run ANOVA.
model2 <- ezANOVA(data=subset(analysisData2,truncationLevel>0), dv = .(qSeverity), wid= .(id), within = .(truncationF,visType,sizeF), observed= .(noticedTruncation,qBothCorrect))

pairwise.t.test(analysisData2$qSeverity,analysisData2$visType,p.adjust.method="bonferroni")

#Plot all of our null effects
exp2Designs <- with(analysisData2, aggregate(qSeverity ~ truncationF*visType, FUN=tboot))

p <- ggplot(exp2Designs, aes(x=visType, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)", title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("Bar","Gradient","Broken"),name="Visualization Design") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5)) + theme(axis.text=element_text(size=12),
        axis.title=element_text(size=18), strip.text=element_text(size=24))

p

ggsave("exp2Designs.pdf", plot=last_plot(), device="pdf")

exp2Noticed <- with(analysisData2, aggregate(qSeverity ~ noticedTruncation*truncationF, FUN=tboot))

p <- ggplot(exp2Noticed, aes(x=noticedTruncation, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)",title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("False","True"),name="Commented on Truncation") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5)) + theme(axis.text=element_text(size=18),
        axis.title=element_text(size=18), strip.text=element_text(size=24))

p

ggsave("exp2Noticed.pdf", plot=last_plot(), device="pdf")

exp2Q10 <- with(analysisData2, aggregate(qSeverity ~ q10Correct, FUN=tboot))

p <- ggplot(exp2Q10, aes(x=q10Correct, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)",title="Post Test Truncation Question Response") + scale_x_discrete(labels=c("Incorrect","Correct"),name="Correct") + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5)) + theme(axis.text=element_text(size=18),
        axis.title=element_text(size=18), strip.text=element_text(size=24))

p

ggsave("exp2Q10.pdf", plot=last_plot(), device="pdf")
