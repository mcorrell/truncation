// TODO: Specify factor levels
// TODO: Specify task questions (different sets for each framing)
// TODO: Hook up factors to the data writing code
// TODO: Add tasks for each framing.

/***
Study Parameters
***/

//What are the visualizations I've implemented so far?
var allVisTypes = ["bar","gradbar","bottomgradbar","scatter","lollipop","gradlollipop","gradbottomlollipop","pointline","line","area","gradarea","bottomgradarea"];

//What type of visualizations will they see?
var visTypes = ["bar","pointline","area"];

//Will the vis be labeled?
//with, above, none
var labelTypes = ["none"];

//How will the task questions be framed? In terms of specific values, in terms of the overall trend, or a mix of both?
//values, trend
var framingTypes = ["values","trend"];

//How many items are in the series?
var dataSizes = [2,3];

//Will the y-axis be futzed with? If so, where will it start?
var truncationTypes = [0,0.5];

//Are the data going up or down?
var trendDirections = [1];

//How much are they going down or up by?
var trendSlopes = [0.25,0.5,1];


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
var x = d3.scaleBand().domain([0,1]).range([margin,vizWidth]).paddingOuter(0.2).paddingInner(0.1);
var y = d3.scaleLinear().domain([0,1]).range([vizHeight-margin,margin]);
var yAxis = d3.axisLeft(y).tickFormat(d3.format(".0%")).tickValues([0,1]);


function makeStimuli(permute){
  //Populate the trial stimuli, optionally permuting the trials
  var stimuli = [];
  var replicates = 1;
  var stimulis;
  var id=gup("id");
  id = id ? id : "EMPTY";
  var index = 1;
  //currently all blocked effects. We'd potentially want some of these to be random.
  for(vis of visTypes){
    for(label of labelTypes){
      for(frame of framingTypes){
        for(size of dataSizes){
          for(truncation of truncationTypes){
            for(direction of trendDirections){
              for(slope of trendSlopes){
                stimulis = {};
                stimulis.visType = vis;
                stimulis.labelType = label;
                stimulis.framing = frame;
                stimulis.dataSize = size;
                stimulis.truncationLevel = truncation;
                stimulis.trendDirection = direction;
                stimulis.trendSlope = slope;
                stimulis.data = genData(stimulis);
                stimuli.push(stimulis);
                index++;
              }
            }
          }
        }
      }
    }
  }

  if(permute){
    dl.permute(stimuli);
  }

  stimuli.forEach(function(d,i){
    d.i = i;
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
};

var nextQuestion = function(){
  console.log(this.responseText);
  questionIndex++;
  //Check to see if the next question is the last one
  if(questionIndex==stimuli.length){
    window.location.href="demographics.html?id="+stimuli[0].id;
  }

  d3.select("#readyBtn")
    .style("visibility",null)
    .attr("disabled",null);

  d3.select("#confirmBtn")
    .attr("disabled","disabled");

  d3.select("#flawType").html("a flaw");

  document.body.scrollTop = document.documentElement.scrollTop = 0;
  d3.select("#progress").html("Question "+(questionIndex+1)+"/"+stimuli.length);
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

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);

};

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

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);
}

var gradBar = function(svg,data){
  //bar chart with a gradient fill, indicating truncation
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  svg.selectAll("rect").data(data).enter().append("rect")
  .attr("x",(d,i) =>  x(i) )
  .attr("y", d => y(d))
  .attr("fill","url(#grad)")
  .attr("height", d => y(y.domain()[0]) - y(d))
  .attr("width",x.bandwidth());

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);
}

var bottomGradBar = function(svg,data){
  //bar chart with a gradient below the y-axis, indicating truncation
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

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);
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

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);
};

var gradLollipop = function(svg,data){
  //lollipop chart with a gradient "stick", indicating truncation
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

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);
};

var gradBottomLollipop = function(svg,data){
  //lollipop chart with a gradient below the y-axis indicating truncation
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

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);
};

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

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);
}

var gradArea = function(svg,data){
  //area chart with a gradient fill indicating truncation
  svg.datum(data);
  x.domain(dl.range(0,data.length,1));

  var path = d3.area()
    .x((d,i) => x(i) + (x.bandwidth()/2))
    .y1(d => y(d))
    .y0(y(y.domain()[0]));

  svg.append("path").datum(data)
    .attr("fill","url(#grad)")
    .attr("d",path);

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);
}

var bottomGradArea = function(svg,data){
  //area chart with a gradient rectange at the bottom indicating truncation
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

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);
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

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);
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

  svg.append("g")
    .attr("transform","translate(" + margin + ",0)")
    .call(yAxis);
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

var testAllGrid = function(){
  //make a big line of all of our vis types, sharing an initial random set of data.
  //Click to have them go away
  var data = dl.random.uniform(0.4,1).samples(5);
  truncate(0.4);
  visTypes.forEach(function(d){
    getVisFunction(d)(d3.select("body").append("svg").classed("vis",true).classed("test",true),data);
  });
  d3.select("body").on("click",function(){ d3.selectAll(".test").remove()});
}

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
  var timestamp = new Date();
  rt = timestamp-rt;
  participantData[questionIndex] = stimuli[questionIndex];
  participantData[questionIndex].rt = rt;
  participantData[questionIndex].timestamp = timestamp.toString();

  d3.select("#vis").selectAll("*:not(.grad)").remove();

  writeAnswer(participantData[questionIndex]);
}


function genData(stimulis){
  // TODO: Fix this to make it correctly spit out values when we've got truncation.
  var min = stimulis.truncationLevel;
  var n = stimulis.dataSize;
  var sign = stimulis.trendDirection;
  var slope = stimulis.trendSlope;
  var max = (slope*n) + min;

  var delta = (max - min)/n;
  var vals = sign==1 ? dl.range(min,max,delta) : dl.range(max,min,-1*delta);
  var jitter = dl.random.uniform(-delta/4,delta/4);

  var constrainJitter = function(d){
    return Math.max(Math.min(d + jitter(),1),min + delta/4);
  }
  return vals.map(d => constrainJitter(d));
}

var writeAnswer = function(response){
  //Called when we answer a question in the first task
  //XML to call out to a php script to store our data in a csv over in ./data/
  var writeRequest = new XMLHttpRequest();
  var writeString = "answer=" + JSON.stringify(response);
  writeRequest.open("GET", "data/writeJSON.php?" + writeString, true);
  writeRequest.setRequestHeader("Content-Type", "application/json");
  writeRequest.addEventListener("load", nextQuestion);
  writeRequest.send();
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
}
