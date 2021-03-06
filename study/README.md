# Study Materials
This folder contains the experimental apparatus to run the study, as well as the data tables for this study.

The study requires PHP and javascript to run successfully.
If you wish to run locally, you'll need to set up a server on your local machine. E.g., through a command like:
```
python -m SimpleHTTPServer 8000
````

Click [here](consent.html?exp=exp1) to try out the first experiment.

Click [here](consent.html?exp=exp2) to try out the second experiment.

Click [here](consent.html?exp=exp3) to try out the third experiment.

The data are contained in the [Data](data/) folder.
[Exp1](data/exp1) contains the data for the first experiment, [Exp2](data/exp2) the data for the second experiment, and [Exp3](data/exp3) the data for the third experiment.

We also include the [R script](data/analysis.R) we used for data analysis and figure generation.

For more human-readable information, check either the [paper](https://arxiv.org/abs/1907.02035) or the included [Supplement](Supplemental.pdf).

We've collected a group of [blogs and other media](blogs.csv) about y-axis truncation as well, in order to characterize the ongoing debate about when it's okay to truncate the y-axis, and how to design around the issue of charts that don't start at 0.

## Demographics Data
`exp1/cleandemo.csv`,`exp2/cleandemo2.csv`, and `exp2/cleandemo3.csv` contain anonymized information about the study participants in each experiment, with the following columns:
* `experiment`: Which experiment these participants participated in, `Exp1`,`Exp2`, or `Exp3`.
* `timestamp`: When the participant submitted the study task, as a UTC timestamp.
* `id`: The anonymous participant id.
* `gender`: The participant gender.
* `age`: The participant age.
* `education`: The participant's level of schooling.
* `graphicity`: How many items the participant got correct on the 13 item graphicity scale.
* `q10`: The answer the participant gave for the 10th graphicity item, which dealt with y-axis truncation.
* `q11`: The answer the participant gave for the 11th graphicity item, which dealt with unlabelled y-axes.
* `strategy`: Free-text response to the question "What strategy or procedure did you use to complete the tasks?"
* `notice`: Free-text response to the question "Did you notice anything odd or unusual about the charts you saw during the task?"
* `comment`: Free-text response to the question "Any additional comments of feedback? "
* `QUAL_coder1`: The first author's coded response concerning whether any of the free-text responses relate to the truncated y-axes on the visualizations in the main task.
* `QUAL_coder2`: The second (non-author) coder's response concerning whether any of the free-text responses relate to the truncated y-axes on the visualizations in the main task.
* `QUAL_mismatch`: Whether there was a mismatch between the two qualitative coders concerning whether the participant mentioned the y-axis manipulation.
* `QUAL_noticed_truncation`: The final agreed-upon qualitative code for the participant concerning whether the participant mentioned the y-axis manipulation.

## Trial Data
`exp1/cleanrows.csv`,`exp2/cleanrows2.csv`, and `exp2/cleanrows3.csv` contain the responses for all participants, with the following columns:

* `visType`: The visual design of the visualization the participants saw. For Exp1, either `bar` or `line`. For Exp2 and Exp3, either `bar`,`brokenbar`, or `bottomgradbar`.
* `framing`: Whether the question about effect size was framed as being about individual `values` or overall `trend`. Exp2 and Exp3 have only the `trend` framing.
* `dataSize`: How many data points were in the graph. Either `2` or `3`.
* `truncationLevel`: Where the y-axis began (in percent). Either `0`,`0.25`, or `0.5`. The y-axis always _ended_ at `1.0` (100%).
* `trendDirection`: Whether the values were increasing (`1`) or decreasing (`-1`).
* `slope`: The difference in value from the lowest to the highest point (in percent). Either `0.125` or `0.25`.
* `id`: The anonymous participant id.
* `index`: The order of the trial in the participant's study. There were 56 trials in Exp1 and 44 in Exp2 and Exp3, with the first 8 being for training/calibration purposes only.
* `training` : Whether this trial was one of the initial 8 training stimuli (`1`) or not (`null`). We excluded training stimuli from analysis.
* `rt`: The time between clicking the ready button, and confirming a response, in milliseconds.
* `timestamp`: When the participant confirmed their response, as a UTC timestamp.
* `qTrend`: The participant's response to the engagement question, asking about the slope of the data. `1` meant increasing, `-1` decreasing.
* `qSeverity`: The participant's response to the subject effect size question. A 5-point rating from `1` (least severe) to `5` (most severe).
* `qFirst`: For Exp3 only, the participant's response when asked for the value of the first point, in percent.
* `qLast`: For Exp3 only, the participant's response when asked for the value of the last point, in percent.
* `trendError`: For Exp3 only, the participant's *measured* slope (`qLast`-`qFirst`) - the *actual* slope (`slope`).
* `correct`: Whether the participant got the engagement question correct (if `qTrend`==`slope` then `1`, else `0`).
* `firstX`: The value of the first item in the data series, in percent.
* `lastX`: The value of the last item in the data series, in percent.
* `x0`...`xn`: The value of the nth item in the data series, in percent. `null` if there were fewer items than the maximum (e.g. half of the visualizations had only two values, and the other half three values).

`analysis.R` is the R script used to conduct the analyses and generate the figures in the paper. It relies on the `ggplot2`, `ez` and `skimr` libraries.
