library(skimr)
library(ez)
library(ggplot2)
library(boot)

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

bootMean <- function(data,indices) {
	d <- data[indices]
	return(mean(d))	
}

bcaboot <- function(x) {
	bootResults <- boot(data = x, statistic = bootMean, R=1000)
	bootCI <- boot.ci(bootResults,type="bca")
	interval <- c(ci1 = bootCI$bca[1,4], mean = mean(x), ci2 = bootCI$bca[1,5])
	return(interval)
}

#Experiment One

#We're relying on two files here:
#cleandemo.csv is my demographic data, and cleanrows.csv is the per-trial information.
#They are called "clean" because I've stripped out any potentially identifying information (ip address) and also I've eliminated duplicate rows and cleaned up any special characters (newlines, commas) in free text responses that would mess with our csv.

#"clean" in cleandemo and cleandata here and in subsequent experiments mean that I:
# 1) merged the per-participant csvs using awk '(NR == 1) || (FNR > 1)' *.csv > cleandata.csv
# 2) got rid of ip and other potentially identifiable columns we were keeping for QA purposes (for instance to see if people were trying to take the study multiple times, or if they ran into technical issues halfway through and needed direct reimbursement, etc.
# 3) dealt with escaped characters/newlines in the free text responses to make the csvs behave nicely
# 4) did some qualitative coding of free text responses
# 5) pruned repeated rows caused by server write issues
# 6) remove data from participants who withdrew from the study

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
exp1Designs <- with(analysisData, aggregate(qSeverity ~ truncationF*visType, FUN=bcaboot))

p <- ggplot(exp1Designs, aes(x=visType, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)", title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("Bar","Line"),name="Chart Type") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5, family="Helvetica")) + theme(axis.text=element_text(size=18, family="Helvetica"),
        axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"),strip.text=element_text(size=24, family="Helvetica"))


p

ggsave("exp1Designs.pdf", plot=last_plot(), device="pdf", width=8, height=5)

#What about the framings?

exp1Framings <- with(analysisData, aggregate(qSeverity ~ framing*visType, FUN=bcaboot))

p <- ggplot(exp1Framings, aes(x=framing, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)", title="Chart Type") + scale_x_discrete(labels=c("Trend","Values"),name="Question Framing") + facet_grid(. ~ visType, labeller=labeller(visType=c(bar = "Bar",line = "Line"))) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5, family="Helvetica")) + theme(axis.text=element_text(size=18, family="Helvetica"),
        axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"), strip.text=element_text(size=24, family="Helvetica"))

p

ggsave("exp1Frames.pdf", plot=last_plot(), device="pdf", width=5, height=5)

#And folks who noticed?

exp1Noticed <- with(analysisData, aggregate(qSeverity ~ noticedTruncation*truncationF, FUN=bcaboot))

p <- ggplot(exp1Noticed, aes(x=noticedTruncation, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)",title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("False","True"),name="Commented on Truncation") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5, family="Helvetica")) + theme(axis.text=element_text(size=18, family="Helvetica"),
        axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"), strip.text=element_text(size=24, family="Helvetica"))

p

ggsave("exp1Noticed.pdf", plot=last_plot(), device="pdf", width=8, height=5)

exp1Q10 <- with(analysisData, aggregate(qSeverity ~ q10Correct, FUN=bcaboot))

p <- ggplot(exp1Q10, aes(x=q10Correct, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)",title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("False","True"),name="Graphicity") + theme_bw() + theme(plot.title = element_text(size=24,hjust=0.5, family="Helvetica")) + theme(axis.text=element_text(size=18, family="Helvetica"),
        axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"), strip.text=element_text(size=24, family="Helvetica"))

p

ggsave("exp1Q10.pdf", plot=last_plot(), device="pdf", width=5, height=5)

#Combined fig of all conditions
exp1All <- with(analysisData, aggregate(qSeverity ~ truncationF*visType*framing, FUN=bcaboot))

p <- ggplot(exp1All, aes(x=visType, y=qSeverity[,2], color=framing)) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75, position=position_dodge(0.4)) + ylim(1,3.5) + labs(y="Perceived Severity (avg)", title="Y-Axis Start Location (%)") + scale_color_manual(labels=c("Trend","Value"),name="Task Framing",values=c("#4E79A7","#E15759")) + scale_x_discrete(labels=c("Bar","Line"),name="Chart Type") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5, family="Helvetica")) + theme(axis.text=element_text(size=12, family="Helvetica"), axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"), strip.text=element_text(size=24, family="Helvetica")) + theme(legend.position="bottom")

p

ggsave("exp1All.pdf", plot=last_plot(), device="pdf", width=8, height=5)


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
exp2Designs <- with(analysisData2, aggregate(qSeverity ~ truncationF*visType, FUN=bcaboot))

p <- ggplot(exp2Designs, aes(x=visType, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)", title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("Bar","Gradient","Broken"),name="Chart Type") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5, family="Helvetica")) + theme(axis.text=element_text(size=12, family="Helvetica"),
        axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"), strip.text=element_text(size=24, family="Helvetica"))

p

ggsave("exp2Designs.pdf", plot=last_plot(), device="pdf", width=8, height=5)

exp2Noticed <- with(analysisData2, aggregate(qSeverity ~ noticedTruncation*truncationF, FUN=bcaboot))

p <- ggplot(exp2Noticed, aes(x=noticedTruncation, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)",title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("False","True"),name="Commented on Truncation") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5, family="Helvetica")) + theme(axis.text=element_text(size=18, family="Helvetica"),
        axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"), strip.text=element_text(size=24, family="Helvetica"))

p

ggsave("exp2Noticed.pdf", plot=last_plot(), device="pdf", width=8, height=5)

exp2Q10 <- with(analysisData2, aggregate(qSeverity ~ q10Correct, FUN=bcaboot))

p <- ggplot(exp2Q10, aes(x=q10Correct, y=qSeverity[,2]),) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75) + ylim(1,NA) + labs(y="Perceived Severity (avg)",title="Post Test Truncation Question Response") + scale_x_discrete(labels=c("Incorrect","Correct"),name="Correct") + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5)) + theme(axis.text=element_text(size=18, family="Helvetica"),
        axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"), strip.text=element_text(size=24, family="Helvetica"))

p

ggsave("exp2Q10.pdf", plot=last_plot(), device="pdf", width=5.5, height=5)

#Experiment Three


#Identical to Experiment Two, but we ask them to estimate the actual values of the first and last bars,:
#cleandemo3.csv is my demographic data, and cleanrows3.csv is the per-trial information.

#Read in demographics data
demo3 <- read.csv("exp3/cleandemo3.csv")

#Did they get the truncation-related questions correct?
demo3$q10Correct <- demo3$q10==3
demo3$q11Correct <- demo3$q11==4
demo3$qBothCorrect <- demo3$q10Correct & demo3$q11Correct
#Did we code them as mentioning the axis truncation in their comments?
demo3$noticedTruncation <- as.logical(demo3$QUAL_noticed_truncation)

#What does our demographic data look like?
skim(demo3)

#Do an inner join on data/demographic info.
data3 <- read.csv("exp3/cleanrows3.csv")
mergedata3 <- merge(data3,demo3,by="id")

#What does the full table look like?
skim(mergedata3)

#Let's look for low performers on our engagement question and filter them out.
#I'm using a 3 sigma standard here.

participantPerformance3 <- with(mergedata3,aggregate(correct ~ id,FUN=mean))
participantPerformance3 <- participantPerformance3[order(participantPerformance3$correct),]

blackList3 <- subset(participantPerformance3,correct<(mean(participantPerformance3$correct) - 3*sd(participantPerformance3$correct)))$id

#analysisData is our main dataframe. Let's populate it with our rows.
analysisData3 <- subset(mergedata3,!(id %in% blackList3))

#Let's also strip out our training/calibration stimuli.
analysisData3 <- analysisData3[is.na(analysisData3$training),]

#Let's coerce some of our numerical factor levels to factors for our ANOVA.
analysisData3$sizeF <- factor(analysisData3$dataSize)
analysisData3$truncationF <- factor(analysisData3$truncationLevel)

#Let's create a "trendError" column as a signed error metric [(predicted last value - predicted first value) - actual slope].
analysisData3$trendError <- (analysisData3$qLast - analysisData3$qFirst) - (analysisData3$slope * analysisData3$trendDirection)
#Let's also create an unsigned absTrendError
analysisData3$absTrendError <- abs(analysisData3$trendError)
#Let's also just see how off participants were at estimating values in general, taking trend out of the equation.
analysisData3$avgTrendError <- (abs(analysisData3$qFirst-analysisData3$firstX) + abs(analysisData3$qLast-analysisData3$lastX)) / 2

#The charts were identical when the truncation level was 0, so let's remove them from our ANOVA

#Run ANOVA.
model3Severity <- ezANOVA(data=subset(analysisData3,truncationLevel>0), dv = .(qSeverity), wid= .(id), within = .(truncationF,visType,sizeF), observed= .(noticedTruncation,qBothCorrect))

pairwise.t.test(analysisData3$qSeverity,analysisData3$truncationF,p.adjust.method="bonferroni")

#I'm also interested in how the different chart types impacted the trendError, which is the estimated difference in values - the actual difference in values. 

model3trendError <- ezANOVA(data=subset(analysisData3,truncationLevel>0), dv = .(absTrendError), wid= .(id), within = .(truncationF,visType,sizeF), observed= .(noticedTruncation,qBothCorrect))

pairwise.t.test(analysisData3$absTrendError,analysisData3$sizeF,p.adjust.method="bonferroni")

#Note that absTrendError onlys capture exaggerations in trend, but not misreadings where the trend is correct, but the values are just off by whatever the truncation level is. E.g. 50-25 = 25% would have 0 absTrendError even if axis truncation caused people to guess 100-75. avgError tries to capture any sytematic errors in assessing values.

model3avgError <- ezANOVA(data=subset(analysisData3,truncationLevel>0), dv = .(avgTrendError), wid= .(id), within = .(truncationF,visType,sizeF), observed= .(noticedTruncation,qBothCorrect))

#Looks like truncationF was the only difference. If people were misreading, we'd expect truncation of 0 to be < 0.25 < 0.5...
pairwise.t.test(analysisData3$avgTrendError,analysisData3$truncationF,p.adjust.method="bonferroni")

#Plots: how did our truncation bias stack up compared to the previous experiment?
exp23Designs <- rbind(with(analysisData2, aggregate(qSeverity ~ truncationF*visType*experiment, FUN=bcaboot)),with(analysisData3, aggregate(qSeverity ~ truncationF*visType*experiment, FUN=bcaboot)))

p <- ggplot(exp23Designs, aes(x=visType, y=qSeverity[,2], color=experiment)) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75, position=position_dodge(0.4)) + ylim(1,3.5) + labs(y="Perceived Severity (avg)", title="Y-Axis Start Location (%)") + scale_color_manual(labels=c("Experiment 2","Experiment 3"),name="",values=c("#FF7F0E","#2CA02C")) + scale_x_discrete(labels=c("Bar","Gradient","Broken"),name="Chart Type") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5, family="Helvetica")) + theme(axis.text=element_text(size=12, family="Helvetica"), axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"), strip.text=element_text(size=24, family="Helvetica")) + theme(legend.position="bottom")

p

ggsave("exp23Designs.pdf", plot=last_plot(), device="pdf", width=8, height=5)

#Was this bias due to people making more errors when the truncation was high?

exp3absErrors <- with(analysisData3, aggregate(absTrendError ~ truncationF*visType,FUN=bcaboot))

p <- ggplot(exp3absErrors, aes(x=visType, y=absTrendError[,2]*100),) + geom_pointrange(aes(ymin=absTrendError[,1]*100, ymax=absTrendError[,3]*100, y=absTrendError[,2]*100), size=0.75) + ylim(1,NA) + labs(y="Error (slope)", title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("Bar","Gradient","Broken"),name="Chart Type") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5, family="Helvetica")) + theme(axis.text=element_text(size=12, family="Helvetica"),
        axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"), strip.text=element_text(size=24, family="Helvetica"))

p

ggsave("exp3absErrors.pdf", plot=last_plot(), device="pdf", width=8, height=5)

exp3avgErrors <- with(analysisData3, aggregate(avgTrendError ~ truncationF*visType,FUN=bcaboot))

p <- ggplot(exp3avgErrors, aes(x=visType, y=avgTrendError[,2]*100),) + geom_pointrange(aes(ymin=avgTrendError[,1]*100, ymax=avgTrendError[,3]*100, y=avgTrendError[,2]*100), size=0.75) + ylim(1,NA) + labs(y="Error (magnitude)", title="Y-Axis Start Location (%)") + scale_x_discrete(labels=c("Bar","Gradient","Broken"),name="Chart Type") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5, family="Helvetica")) + theme(axis.text=element_text(size=12, family="Helvetica"),
        axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"), strip.text=element_text(size=24, family="Helvetica"))

p

ggsave("exp3avgErrors.pdf", plot=last_plot(), device="pdf", width=8, height=5)

#People who were chattier about noticing the y-axis truncation seemed to be less biased, except in Experiment 3

exp123Noticed <- with(analysisData, aggregate(qSeverity ~ noticedTruncation*truncationF*experiment, FUN=bcaboot))
exp123Noticed <- rbind(exp123Noticed,with(analysisData2, aggregate(qSeverity ~ noticedTruncation*truncationF*experiment, FUN=bcaboot)))
exp123Noticed <- rbind(exp123Noticed,with(analysisData3, aggregate(qSeverity ~ noticedTruncation*truncationF*experiment, FUN=bcaboot)))

p <- ggplot(exp123Noticed, aes(x=noticedTruncation, y=qSeverity[,2], color=experiment)) + geom_pointrange(aes(ymin=qSeverity[,1], ymax=qSeverity[,3], y=qSeverity[,2]), size=0.75, position=position_dodge(0.4)) + ylim(1,NA) + labs(y="Perceived Severity (avg)", title="Y-Axis Start Location (%)") + scale_color_manual(labels=c("Experiment 1","Experiment 2","Experiment 3"),name="",values=c("#B07AA1","#FF7F0E","#2CA02C")) + scale_x_discrete(labels=c("False","True"),name="Commented on Truncation") + facet_grid(. ~ truncationF) + theme_bw() + theme(plot.title = element_text(size=18,hjust=0.5, family="Helvetica")) + theme(axis.text=element_text(size=12, family="Helvetica"), axis.title=element_text(size=18, family="Helvetica"), strip.background=element_rect(color="white", fill="white"), strip.text=element_text(size=24, family="Helvetica")) + theme(legend.position="bottom") 

p

ggsave("exp123Noticed.pdf", plot=last_plot(), device="pdf", width=8, height=5)