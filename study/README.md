# Study Materials
This folder contains the experimental apparatus to run the study, as well as the data tables for this study.

The study requires PHP and javascript to run successfully.

Click [here](consent.html?exp=exp1) to try out the first experiment.

Click [here](consent.html?exp=exp2) to try out the second experiment.

The data are contained in the [Data](data/) folder.
[Exp1](data/exp1) contains the data for the first experiment, and [Exp1](data/exp2) the data for the second experiment.

We also include the [R script](data/analysis.R) we used for data analysis and figure generation.

## Demographics Data
`exp1/cleandemo.csv` and `exp2/cleandemo2.csv` contain anonymized information about the study participants in each experiment, with the following columns:
* `experiment`: Which experiment these participants participated in, `Exp1` or `Exp2`.
* `timestamp`: When the participant submitted the study task, as a UTC timestamp.
* `id`: The anonymous participant id.
* `gender`: The participant gender.
* `age`: The participant age.
* `education`: The participant level of schooling.
* `graphicity`: How many items the participant got correct on the 13 item graphicity scale.
* `q10`: The answer the participant gave for the 10th graphicity item, which dealt with y-axis truncation.
* `q11`: The answer the participant gave for the 11th graphicity item, which dealt with unlabelled y-axes.
* `strategy`: Free-text response to the question "What strategy or procedure did you use to complete the tasks?"
* `notice`: Free-text response to the question "Did you notice anything odd or unusual about the charts you saw during the task?"
* `comment`: Free-text response to the question "Any additional comments of feedback? "
* `QUAL_noticed_truncation`: The first author's coded response concerning whether any of the free-text responses relate to the truncated y-axes on the visualizations in the main task.

## Trial Data
`exp1/cleanrows.csv`and `exp2/cleanrows2.csv` contain the responses for all participants, with the following columns:

* `visType`: The visual design of the visualization the participants saw. For Exp1, either `bar` or `line`. For Exp2, either `bar`,`brokenbar`, or `bottomgradbar`.
* `framing`: Whether the question about effect size was framed as being about individual `values` or overall `trend`. Exp1 had only the `trend` framing.
* `dataSize`: How many data points were in the graph. Either `2` or `3`.
* `truncationLevel`: Where the y-axis began (in percent). Either `0`,`0.25`, or `0.5`. The y-axis always _ended_ at `1.0` (100%).
* `trendDirection`: Whether the values were increasing (`1`) or decreasing (`-1`).
* `slope`: The difference in value from the lowest to the highest point (in percent). Either `0.125` or `0.25`.
* `id`: The anonymous participant id.
* `index`: The order of the trial in the participant's study. There were 56 trials in Exp1 and 44 in Exp2, with the first 8 being for training/calibration purposes only.
* `training` : Whether this trial was one of the initial 8 training stimuli (`1`) or not (`null`). We excluded training stimuli from analysis.
* `rt`: The time between clicking the ready button, and confirming a response, in milliseconds.
* `timestamp`: When the participant confirmed their response, as a UTC timestamp.
* `qTrend`: The participant's response to the engagement question, asking about the slope of the data. `1` meant increasing, `-1` decreasing.
* `qSeverity`: The participant's response to the subject effect size question. A 5-point rating from `1` (least severe) to `5` (most severe).
* `correct`: Whether the participant got the engagement question correct (if `qTrend`==`slope` then `1`, else `0`).
* `firstX`: The value of the first item in the data series, in percent.
* `lastX`: The value of the last item in the data series, in percent.
* `x0`...`x`n: The value of the nth item in the data series, in percent. `null` if there were fewer items than the maximum (e.g. half of the visualizations had only two values, and the other half three values).
 the scatterplot, or the number of bins in the histogram.

`analysis.R` is the R script used to conduct the analyses and generate the figures in the paper. It relies on the `ggplot2`, `ez` and `skimr` libraries.
