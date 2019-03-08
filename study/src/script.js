// TODO: Specify factor levels
// TODO: Specify task questions (different sets for each framing)
// TODO: Hook up factors to the data writing code
// TODO: Add tasks for each framing.


/***
Study Parameters
***/

//What are the visualizations I've implemented so far?
var allVisTypes = ["bar","brokenbar","brokengradbar","gradbar","bottomgradbar","scatter","lollipop","gradlollipop","gradbottomlollipop","brokenlollipop","brokengradlollipop","pointline","line","area","gradarea","bottomgradarea"];

//What type of visualizations will they see?
var visTypes = ["bar","brokenbar","bottomgradbar"];

//Will the individual values be labeled?
//with, above, none
var labelTypes = ["none"];

//How will the task questions be framed? In terms of specific values, in terms of the overall trend, or a mix of both?
//values, trend
var framingTypes = ["trend"];

//How many items are in the series?
var dataSizes = [2,3];

//Will the y-axis be futzed with? If so, where will it start?
var truncationTypes = [0,0.25,0.5];

//Are the data going up or down?
var trendDirections = [1,-1];

var slopes = [0.125,0.25];
/***
Global Variables and Settings
***/
var participantData = [];
var rt;
var stimuli = makeStimuli(true);
var questionIndex = 0;


//The actual visual properties of our visualizations
var vizWidth = 400;
var vizHeight = 300;
var margin = 40;
var markSize = 10;
var lineWidth = 4;
var x = d3.scaleBand().domain([0,1]).range([margin,vizWidth-margin]).paddingOuter(0.2).paddingInner(0.1);
var y = d3.scaleLinear().domain([0,1]).range([vizHeight-margin,margin]);
var yAxis = d3.axisLeft(y).tickFormat(d3.format(".0%")).tickValues([0,1]);
var xAxis = d3.axisBottom(x);

function makeStimuli(permute){
  //Populate the trial stimuli, optionally permuting the trials
  var training = [];
  var stimuli = [];
  var replicates = 1;
  var stimulis;
  var id=gup("id");
  id = id ? id : "EMPTY";
  var index = 1;

  var trainingReplications = 2;
  //want stimuli showing the full range of slopes/truncations in order to give people anchor points. These stimuli are discarded from analysis.
  for(var i = 0;i<trainingReplications;i++){
    for(truncation of [truncationTypes[0],truncationTypes[truncationTypes.length-1]]){
      for(slope of [slopes[0],slopes[slopes.length-1]]){
        stimulis = {};
        stimulis.visType = visTypes[~~(Math.random() * visTypes.length)];
        stimulis.labelType = "none";
        stimulis.framing = framingTypes[~~(Math.random() * framingTypes.length)];
        stimulis.dataSize = dataSizes[~~(Math.random() * dataSizes.length)];
        stimulis.truncationLevel = truncation;
        stimulis.trendDirection = trendDirections[~~(Math.random() * trendDirections.length)];
        stimulis.slope = slope;
        stimulis.id = id;
        stimulis.index = index;
        stimulis.data = genData(stimulis);
        stimulis.training=true;
        training.push(stimulis);
        index++;
      }
    }
  }

  if(permute){
    dl.permute(training);
  }

  //currently all blocked effects, except for trend direction, which is random.
  for(vis of visTypes){
    for(label of labelTypes){
      for(frame of framingTypes){
        for(truncation of truncationTypes){
          for(slope of slopes){
              stimulis = {};
              stimulis.visType = vis;
              stimulis.labelType = label;
              stimulis.framing = frame;
              stimulis.dataSize = dataSizes[~~(Math.random() * dataSizes.length)];
              stimulis.truncationLevel = truncation;
              stimulis.trendDirection = trendDirections[~~(Math.random() * trendDirections.length)];
              stimulis.slope = slope;
              stimulis.id = id;
              stimulis.index = index;
              stimulis.data = genData(stimulis);
              stimulis.training=false;
              stimuli.push(stimulis);
              index++;
          }
        }
      }
    }
  }

  if(permute){
    dl.permute(stimuli);
  }

  stimuli = training.concat(stimuli);

  stimuli.forEach(function(d,i){
    d.index = i+1;
  });

  d3.select("#progress").html("Question 1/"+stimuli.length);
  return stimuli;
}


/***
UI Functions
***/

var ready = function(){
  //What happens when the participant clicks the ready button.
  // The RT timer starts.
  // The vis is drawn.
  // The "Confirm" button becomes enabled.

  //You can't "ready" twice.
  d3.select("#readyBtn")
    .style("visibility","hidden")
    .attr("disabled","disabled");

  rt = new Date();
  makeVis(stimuli[questionIndex]);
  makeQuestions(stimuli[questionIndex]);
};

var nextQuestion = function(){
  console.log(this.responseText);
  questionIndex++;
  //Check to see if the next question is the last one
  if(questionIndex==stimuli.length){
    window.location.href="graphicity.html?id="+stimuli[0].id;
  }

  d3.select("#readyBtn")
    .style("visibility",null)
    .attr("disabled",null);

  d3.select("#confirmBtn")
    .attr("disabled","disabled");

  document.body.scrollTop = document.documentElement.scrollTop = 0;
  d3.select("#progress").html("Question "+(questionIndex+1)+"/"+stimuli.length);
}

var makeQuestions = function(stimulis){
  //Pandey et al questions:
  //1-5 Rating scale
  //"How much do you think [quantity A] has improved in terms of [the context] between [time period]?"
  //"How much better do you think is [quantity A] as compared to [quantity B] in terms of [the context]?"
  var questions = d3.select("#questions").append("form")
    .attr("name","questions");

  var binaryQ = stimulis.framing=="values" ?
  "Which value is larger, the first value or the last value?" :
  "Are the values increasing or descreasing?";

  var binaryItems = stimulis.framing=="values" ? ["First","Last"] : ["Descreasing","Increasing"];

  var scaleQ = stimulis.framing=="values" ?
  "Subjectively, how different is the first value compared to the last value?" :
  "Subjectively, how quickly are the values changing?";

  var scaleItems = stimulis.framing=="values" ?
  ["Almost the Same","","Somewhat Different","","Extremely Different"] :
  ["Barely","","Somewhat","","Extremely Quickly"];

  makeScale(questions,"q1",binaryQ,binaryItems,false);
  makeScale(questions,"q2",scaleQ,scaleItems,true);

  questions.selectAll("input").on("change",checkInput);
}

var checkInput = function(){
  if(+document.forms["questions"]["q1"].value && +document.forms["questions"]["q2"].value){
    d3.select("#confirmBtn").attr("disabled",null);
  }
}

var makeScale = function(parent,id,question,labels,showNumbers){
    //Makes a rating scale

    var items = labels.length;

    parent.append("div")
      .text(question)
      .style("font-weight","bold");

    var scale = parent.append("div")
      .classed("scale",true)
      .attr("id",id);

    scale.style("grid-template-columns","repeat("+items+","+(100/items)+"%)");

    var numbers = showNumbers ? dl.range(1,items+1).concat(dl.range(0,items)) : dl.range(0,items);
    //[1,2,3,4,5,0,1,2,3,4];

    scale.selectAll("label").data(numbers).enter().append("label")
      .text( (d,i) => i<items&&showNumbers ? d : labels[d])
      .attr("for", (d,i) => i<items ? id+(i+1) : id+((i%labels.length)+1));

    scale.selectAll("input").data(dl.range(1,items+1)).enter().append("input")
      .attr("type","radio")
      .attr("name",id)
      .attr("id",d => id+d)
      .attr("value",d =>d);

    scale.append("br");
}

/***
Viz Functions
***/
var makeVis = function(stimulis){
  var draw = getVisFunction(stimulis.visType);
  truncate(stimulis.truncationLevel);
  draw(d3.select("#vis"),stimulis.data);
  switch(stimulis.labelType){
    case "with":
    drawLabels(d3.select("#vis"));
    break;

    case "above":
    drawTopLabels(d3.select("#vis"));
    break;

    case "none":
    default:
    break;
  }
}

var scatter = function(svg,data){
  //scatterplot
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  svg.selectAll("circle").data(data).enter().append("circle")
    .attr("fill","#333")
    .attr("r",markSize)
    .attr("cx", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("cy", d => y(d));

  drawAxes(svg);

};

var drawAxes = function(svg){
  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);

  svg.append("g")
    .attr("transform","translate(0," + (vizHeight-margin) + ")")
    .call(xAxis);
}

var bar = function(svg,data){
  //bar chart
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  svg.selectAll("rect").data(data).enter().append("rect")
  .attr("x",(d,i) =>  x(i) )
  .attr("y", d => y(d))
  .attr("fill","#333")
  .attr("height", d => y(y.domain()[0]) - y(d))
  .attr("width",x.bandwidth());

  drawAxes(svg);
}

var brokenBar = function(svg,data){
  //bar chart with a "broken" axis.
  var t = y.domain()[0];

  if(t<=0){
    bar(svg,data);
    return;
  }

  var denom = 4;
  var breakPoint = 1/denom;
  while(breakPoint > t){
    denom++;
    breakPoint = 1/denom;
  }

  var breakHeight = 2*vizHeight/3;
  var breakMargin = vizHeight/20;
  var y1 = d3.scaleLinear().domain([0,breakPoint]).range([vizHeight-margin,breakHeight+(breakMargin/2)]).clamp(true);
  var y2 = d3.scaleLinear().domain([t,1]).range([breakHeight-(breakMargin/2),margin]);
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  //before the break values
  svg.append("g").selectAll("rect").data(data).enter().append("rect")
  .attr("x",(d,i) =>  x(i) )
  .attr("y", d => y1(d))
  .attr("fill","#333")
  .attr("height", d => y1(0) - y1(d))
  .attr("width",x.bandwidth());

  //after the break values
  svg.append("g").selectAll("rect").data(data).enter().append("rect")
  .attr("x",(d,i) =>  x(i) )
  .attr("y", d => y2(d))
  .attr("fill","#333")
  .attr("height", d => y2(t) - y2(d))
  .attr("width",x.bandwidth());

  var y1Axis = d3.axisLeft(y1).tickFormat(d3.format(".0%")).tickValues([0]);
  var y2Axis = d3.axisLeft(y2).tickFormat(d3.format(".0%")).tickValues([t,1]);

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(y1Axis);

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(y2Axis);

  svg.append("g")
    .attr("transform","translate(0," + (vizHeight-margin) + ")")
    .call(xAxis);
}

var brokenGradBar = function(svg,data){
  //bar chart with a "broken" axis and a gradient fill towards and away from the break
  var t = y.domain()[0];

  //if there's no truncation, then it's just a regular bar chart
  if(t<=0){
    bar(svg,data);
    return;
  }

  //otherwise, we choose a place to break the axis, ideally at some nice fraction.
  var denom = 4;
  var breakPoint = 1/denom;
  while(breakPoint > t){
    denom++;
    breakPoint = 1/denom;
  }

  //most of the chart is the devoted to the top section.
  var breakHeight = 2*vizHeight/3;
  var breakMargin = vizHeight/20;
  var y1 = d3.scaleLinear().domain([0,breakPoint]).range([vizHeight-margin,breakHeight+(breakMargin/2)]).clamp(true);
  var y2 = d3.scaleLinear().domain([t,1]).range([breakHeight-(breakMargin/2),margin]);
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  //before the break values
  svg.append("g").selectAll("rect").data(data).enter().append("rect")
  .attr("x",(d,i) =>  x(i) )
  .attr("y", d => y1(d))
  .attr("fill","url(#rgrad)")
  .attr("height", d => y1(0) - y1(d))
  .attr("width",x.bandwidth());

  //after the break values
  svg.append("g").selectAll("rect").data(data).enter().append("rect")
  .attr("x",(d,i) =>  x(i) )
  .attr("y", d => y2(d))
  .attr("fill","url(#grad)")
  .attr("height", d => y2(t) - y2(d))
  .attr("width",x.bandwidth());

  var y1Axis = d3.axisLeft(y1).tickFormat(d3.format(".0%")).tickValues([0]);
  var y2Axis = d3.axisLeft(y2).tickFormat(d3.format(".0%")).tickValues([t,1]);

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(y1Axis);

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(y2Axis);

  svg.append("g")
    .attr("transform","translate(0," + (vizHeight-margin) + ")")
    .call(xAxis);
}

var gradBar = function(svg,data){
  //bar chart with a gradient fill, indicating truncation

  if(t<=0){
    bar(svg,data);
    return;
  }

  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  svg.selectAll("rect").data(data).enter().append("rect")
  .attr("x",(d,i) =>  x(i) )
  .attr("y", d => y(d))
  .attr("fill","url(#grad)")
  .attr("height", d => y(y.domain()[0]) - y(d))
  .attr("width",x.bandwidth());

  drawAxes(svg);
}

var bottomGradBar = function(svg,data){
  //bar chart with a gradient below the y-axis, indicating truncation

  if(t<=0){
    bar(svg,data);
    return;
  }

  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  var bars = svg.selectAll("rect").data(data).enter();

  bars.append("rect")
  .attr("x",(d,i) =>  x(i) )
  .attr("y", d => y(d))
  .attr("fill","#333")
  .attr("height", d => y(y.domain()[0]) - y(d))
  .attr("width",x.bandwidth());

  bars.append("rect")
    .attr("x",(d,i) =>  x(i) )
    .attr("y", vizHeight-margin)
    .attr("fill","url(#grad)")
    .attr("height", margin)
    .attr("width",x.bandwidth());

  drawAxes(svg);
}

var lollipop = function(svg,data){
  //lollipop chart
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  var g = svg.append("g");

  g.selectAll("circle").data(data).enter().append("circle")
    .attr("fill","#333")
    .attr("r",markSize)
    .attr("cx", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("cy", d => y(d));

  g.selectAll("line").data(data).enter().append("line")
    .attr("stroke","#333")
    .attr("x1", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("x2", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("y1", y(y.domain()[0]))
    .attr("y2", d => y(d))
    .attr("stroke-width",lineWidth);

  drawAxes(svg);
};

var gradLollipop = function(svg,data){
  //lollipop chart with a gradient "stick", indicating truncation

  if(t<=0){
    lollipop(svg,data);
    return;
  }

  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  var g = svg.append("g");

  g.selectAll("circle").data(data).enter().append("circle")
    .attr("fill","#333")
    .attr("r",markSize)
    .attr("cx", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("cy", d => y(d));

  g.selectAll("rect").data(data).enter().append("rect")
    .attr("fill","url(#grad)")
    .attr("x", (d,i) => x(i)-(lineWidth/2) + (x.bandwidth()/2))
    .attr("y",d => y(d))
    .attr("width",lineWidth)
    .attr("height",d => y(y.domain()[0]) - y(d));

  drawAxes(svg);
};

var gradBottomLollipop = function(svg,data){
  //lollipop chart with a gradient below the y-axis indicating truncation

  if(t<=0){
    lollipop(svg,data);
    return;
  }

  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  var g = svg.append("g");

  g.selectAll("circle").data(data).enter().append("circle")
    .attr("fill","#333")
    .attr("r",markSize)
    .attr("cx", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("cy", d => y(d));

  g.selectAll("line").data(data).enter().append("line")
    .attr("stroke","#333")
    .attr("x1", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("x2", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("y1", y(y.domain()[0]))
    .attr("y2", d => y(d))
    .attr("stroke-width",lineWidth);

  g.selectAll("rect").data(data).enter().append("rect")
    .attr("fill","url(#grad)")
    .attr("x", (d,i) => x(i)-(lineWidth/2) + (x.bandwidth()/2))
    .attr("y",vizHeight-margin)
    .attr("width",lineWidth)
    .attr("height",margin);

  drawAxes(svg);
};

var brokenLollipop = function(svg,data){
  //lollipop chart with a "broken" axis
  var t = y.domain()[0];

  //if there's no truncation, then it's just a regular bar chart
  if(t<=0){
    lollipop(svg,data);
    return;
  }

  //otherwise, we choose a place to break the axis, ideally at some nice fraction.
  var denom = 4;
  var breakPoint = 1/denom;
  while(breakPoint > t){
    denom++;
    breakPoint = 1/denom;
  }

  //half of the chart is the devoted to each section.
  var breakHeight = 2*vizHeight/3;
  var breakMargin = vizHeight/20;
  var y1 = d3.scaleLinear().domain([0,breakPoint]).range([vizHeight-margin,breakHeight+(breakMargin/2)]).clamp(true);
  var y2 = d3.scaleLinear().domain([t,1]).range([breakHeight-(breakMargin/2),margin]);
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));


  svg.append("g").selectAll("circle").data(data.filter(d => d>t)).enter().append("circle")
    .attr("fill","#333")
    .attr("r",markSize)
    .attr("cx", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("cy", d => y2(d));

  svg.append("g").selectAll("circle").data(data.filter(d => d<breakPoint)).enter().append("circle")
    .attr("fill","#333")
    .attr("r",markSize)
    .attr("cx", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("cy", d => y1(d));

  svg.append("g").selectAll("line").data(data).enter().append("line")
    .attr("stroke","#333")
    .attr("x1", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("x2", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("y1", y1(0))
    .attr("y2", d => y1(d))
    .attr("stroke-width",lineWidth);

    svg.append("g").selectAll("line").data(data).enter().append("line")
      .attr("stroke","#333")
      .attr("x1", (d,i) => x(i) + (x.bandwidth()/2))
      .attr("x2", (d,i) => x(i) + (x.bandwidth()/2))
      .attr("y1", y2(t))
      .attr("y2", d => y2(d))
      .attr("stroke-width",lineWidth);

  var y1Axis = d3.axisLeft(y1).tickFormat(d3.format(".0%")).tickValues([0]);
  var y2Axis = d3.axisLeft(y2).tickFormat(d3.format(".0%")).tickValues([t,1]);

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(y1Axis);

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(y2Axis);

  svg.append("g")
    .attr("transform","translate(0," + (vizHeight-margin) + ")")
    .call(xAxis);
}

var brokenGradLollipop = function(svg,data){
  //lollipop chart with a "broken" axis
  var t = y.domain()[0];

  //if there's no truncation, then it's just a regular bar chart
  if(t<=0){
    lollipop(svg,data);
    return;
  }

  //otherwise, we choose a place to break the axis, ideally at some nice fraction.
  var denom = 4;
  var breakPoint = 1/denom;
  while(breakPoint > t){
    denom++;
    breakPoint = 1/denom;
  }

  //half of the chart is the devoted to each section.
  var breakHeight = 2*vizHeight/3;
  var breakMargin = vizHeight/20;
  var y1 = d3.scaleLinear().domain([0,breakPoint]).range([vizHeight-margin,breakHeight+(breakMargin/2)]).clamp(true);
  var y2 = d3.scaleLinear().domain([t,1]).range([breakHeight-(breakMargin/2),margin]);
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));


  svg.append("g").selectAll("circle").data(data.filter(d => d>t)).enter().append("circle")
    .attr("fill","#333")
    .attr("r",markSize)
    .attr("cx", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("cy", d => y2(d));

  svg.append("g").selectAll("circle").data(data.filter(d => d<breakPoint)).enter().append("circle")
    .attr("fill","#333")
    .attr("r",markSize)
    .attr("cx", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("cy", d => y1(d));

  svg.append("g").selectAll("rect").data(data).enter().append("rect")
    .attr("fill","url(#rgrad)")
    .attr("x", (d,i) => x(i)-(lineWidth/2) + (x.bandwidth()/2))
    .attr("y",d => y1(d))
    .attr("width",lineWidth)
    .attr("height",d => y1(0) - y1(d));

  svg.append("g").selectAll("rect").data(data).enter().append("rect")
    .attr("fill","url(#grad)")
    .attr("x", (d,i) => x(i)-(lineWidth/2) + (x.bandwidth()/2))
    .attr("y",d => y2(d))
    .attr("width",lineWidth)
    .attr("height",d => y2(t) - y2(d));

  var y1Axis = d3.axisLeft(y1).tickFormat(d3.format(".0%")).tickValues([0]);
  var y2Axis = d3.axisLeft(y2).tickFormat(d3.format(".0%")).tickValues([t,1]);

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(y1Axis);

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(y2Axis);

  svg.append("g")
    .attr("transform","translate(0," + (vizHeight-margin) + ")")
    .call(xAxis);
}

var area = function(svg,data){
  //area chart
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  var path = d3.area()
    .x((d,i) => x(i) + (x.bandwidth()/2))
    .y1(d => y(d))
    .y0(y(y.domain()[0]));

  svg.append("path").datum(data)
    .attr("fill","#333")
    .attr("d",path);

  drawAxes(svg);
}

var gradArea = function(svg,data){
  //area chart with a gradient fill indicating truncation

  if(t<=0){
    area(svg,data);
    return;
  }

  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  var path = d3.area()
    .x((d,i) => x(i) + (x.bandwidth()/2))
    .y1(d => y(d))
    .y0(y(y.domain()[0]));

  svg.append("path").datum(data)
    .attr("fill","url(#grad)")
    .attr("d",path);

  drawAxes(svg);
}

var bottomGradArea = function(svg,data){
  //area chart with a gradient rectange at the bottom indicating truncation

  if(t<=0){
    area(svg,data);
    return;
  }

  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  var path = d3.area()
    .x((d,i) => x(i) + (x.bandwidth()/2))
    .y1(d => y(d))
    .y0(y(y.domain()[0]));

  svg.append("path").datum(data)
    .attr("fill","#333")
    .attr("d",path);

  svg.append("rect")
    .attr("fill","url(#grad)")
    .attr("x", x(0) + (x.bandwidth()/2))
    .attr("y", vizHeight - margin)
    .attr("width",x(data.length-1)-x(0))
    .attr("height", margin);

  drawAxes(svg);
}

var line = function(svg,data){
  //line chart
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  var path = d3.line()
    .x((d,i) => x(i) + (x.bandwidth()/2))
    .y(d => y(d));

  svg.append("path").datum(data)
    .attr("stroke","#333")
    .attr("stroke-width",lineWidth)
    .attr("fill","none")
    .attr("d",path);

  drawAxes(svg);
}

var pointLine = function(svg,data){
  //scatterplot with lines connecting the points.
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  var path = d3.line()
    .x((d,i) => x(i) + (x.bandwidth()/2))
    .y(d => y(d));

  var g = svg.append("g");

  g.append("path").datum(data)
    .attr("stroke","#333")
    .attr("stroke-width",lineWidth)
    .attr("fill","none")
    .attr("d",path);

  g.selectAll("circle").data(data).enter().append("circle")
    .attr("fill","#333")
    .attr("r",markSize)
    .attr("cx", (d,i) => x(i) + (x.bandwidth()/2))
    .attr("cy", d => y(d));

  drawAxes(svg);
}

var drawLabels = function(svg){
  //draw text showing the values directly above each mark
  var data = svg.datum();
  svg.append("g").selectAll("text").data(data).enter().append("text")
    .attr("x",(d,i) => x(i) + (x.bandwidth()/2))
    .attr("text-anchor","middle")
    .attr("y" , d => y(d)-12)
    .text(d => d3.format(".0%")(d));
}

var drawTopLabels = function(svg){
  //draw text showing the values way at the top of the chart
  var data = svg.datum();
  svg.append("g").selectAll("text").data(data).enter().append("text")
    .attr("x",(d,i) => x(i) + (x.bandwidth()/2))
    .attr("text-anchor","middle")
    .attr("y" ,"1em")
    .text(d => d3.format(".0%")(d));
}

function getVisFunction(vizType){
  //big case statement for choosing our draw function.
  var makeViz;
  switch(vizType){
    case "scatter":
      makeViz = scatter;
    break;

    case "area":
      makeViz = area;
    break;

    case "gradarea":
      makeViz = gradArea;
    break;

    case "bottomgradarea":
      makeViz = bottomGradArea;
    break;

    case "lollipop":
      makeViz = lollipop;
    break

    case "gradlollipop":
      makeViz = gradLollipop;
    break;

    case "gradbottomlollipop":
      makeViz = gradBottomLollipop;
    break;

    case "brokenlollipop":
      makeViz = brokenLollipop;
    break;

    case "brokengradlollipop":
      makeViz = brokenGradLollipop;
    break;

    case "gradbar":
      makeViz = gradBar;
    break;

    case "bottomgradbar":
      makeViz = bottomGradBar;
    break;

    case "line":
      makeViz = line;
    break;

    case "pointline":
      makeViz = pointLine;
    break;

    case "brokenbar":
      makeViz = brokenBar;
    break;

    case "brokengradbar":
      makeViz = brokenGradBar;
    break;

    case "bar":
    default:
      makeViz = bar;
    break;



  }
  return makeViz;
}

function truncate(val){
  //futz with our y axis
    val = Math.max(Math.min(val,1),0);
    y.domain([val,1]);
    yAxis.tickValues([val,1]);
}

/***
Test and Debug Functions
***/

var changeVisType = function(newViz,newParameter){
  //change the current vis that is in "#vis" to a different one, preserving whatever data was there.
  var makeViz = getVisFunction(newViz);
  var data = d3.select("svg").datum();
  d3.select("#vis").selectAll("*:not(.grad)").remove();
  makeViz(d3.select("svg"),data,newParameter);
}

var testVis = function(vizType){
  //make a vis of the current type in #vis, with random data.
  var makeViz = getVisFunction(vizType);
  d3.select("#vis").selectAll("*:not(.grad)").remove();
  makeViz(d3.select("svg"),dl.random.uniform(0,1).samples(5));
}

var testAll = function(){
  //periodically sample through all vis types, keeping an initial random set of data.
  var data = dl.random.uniform(0,1).samples(5);
  var index = 0;
  testVis(visTypes[index]);
  d3.interval(function(){
    index = (index+1) % visTypes.length;
    changeVisType(visTypes[index]);
  },1000);
}

var testAllGrid = function(useAll=true){
  //make a big line of all of our vis types, sharing an initial random set of data.
  //Click to have them go away
  var typesToTest = useAll ? allVisTypes : visTypes;
  var data = dl.random.uniform(0.4,1).samples(5);
  truncate(0.4);
  typesToTest.forEach(function(d){
    getVisFunction(d)(d3.select("body").append("svg").classed("vis",true).classed("test",true).attr("id",d),data);
  });
  d3.select("body").on("click",function(){ d3.selectAll(".test").remove()});
}

var writeAnswer = function(response){
  //Called when we answer a question in the first task
  //XML to call out to a php script to store our data in a csv over in ./data/

  //deal with our array of values in 'data'
  //we want a "firstX" and "lastX" values and then we just stash all other values as x0...xn.
  //since length can be << datasize, fill the empty values with ''
  var toWrite = JSON.parse(JSON.stringify(response));
  var data = toWrite.data;
  toWrite.firstX = data[0];
  toWrite.lastX = data[data.length-1];

  for(var i = 0;i<dl.max(dataSizes);i++){
    toWrite['x'+i] = data[i] ? data[i] : '';
  }

  delete toWrite.data;

  var writeRequest = new XMLHttpRequest();
  var writeString = "answer=" + JSON.stringify(toWrite);
  writeRequest.open("GET", "data/writeJSON.php?" + writeString, true);
  writeRequest.setRequestHeader("Content-Type", "application/json");
  writeRequest.addEventListener("load", nextQuestion);
  writeRequest.send();
};


/***
Utility Functions
***/

var answer = function(){

  //What happens when we "confirm" our selection.
  //Get rid of the existing vizzes
  //Increment the question num
  //See if we were right
  //See how long it took
  //If it's the last question, go to the post test/wrap up screen

  d3.select("#confirmBtn")
    .attr("disabled","disabled");


  var timestamp = new Date();
  rt = timestamp-rt;
  participantData[questionIndex] = stimuli[questionIndex];
  participantData[questionIndex].rt = rt;
  participantData[questionIndex].timestamp = timestamp.toString();
  participantData[questionIndex].qTrend = +document.forms["questions"]["q1"].value;
  participantData[questionIndex].qTrend = participantData[questionIndex].qTrend==1 ? -1 : 1;
  participantData[questionIndex].qSeverity = +document.forms["questions"]["q2"].value;
  participantData[questionIndex].correct = (participantData[questionIndex].qTrend == participantData[questionIndex].trendDirection) ? 1 : 0;

  d3.select("#vis").selectAll("*:not(.grad)").remove();
  d3.select("#questions").selectAll("*").remove();

  writeAnswer(participantData[questionIndex]);
}


function genData(stimulis){
  //Data should always be in the range [max trunacation val,1]
  //The first and last points should be the beginning and end of our slope value
  //With some jitter in between

  var n = stimulis.dataSize;
  var sign = stimulis.trendDirection;
  var slope = stimulis.slope;
  var min = dl.max(truncationTypes)+0.05;
  var max = 1;
  var delta = slope/n;
  var dmin = sign==1 ? min : max - slope;
  var dmax = sign==1 ? min + slope : max;
  var vals = sign==1 ? dl.range(dmin,dmax,delta) : dl.range(dmax,dmin,-1*delta);
  var jitter = dl.random.uniform(-delta/4,delta/4);

  var constrainJitter = function(d,i){
    return (i!=0 && i!=n-1) ? Math.max(Math.min(d + jitter(),dmax),dmin + delta/4) : d;
  }
  return vals.map((d,i) => constrainJitter(d,i));
}

function gup(name){
  //grab our html get variables
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp( regexS );
  var tmpURL = window.location.href;
  var results = regex.exec( tmpURL );
  if ( results == null )
  return "";
  else
  return results[1];
};
