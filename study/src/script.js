/***
Study Parameters
***/
var visTypes = ["bar","gradbar","bottomgradbar","scatter","lollipop","gradlollipop","gradbottomlollipop","pointline","line","area","gradarea","bottomgradarea"];
var labelTypes = ["none","top","with"]

//Populate the trial stimuli, optionally permuting the trials
var makeStimuli = function(permute){
  var stimuli = [];
  //what distribution type the null is generated from
  //var distributions = ["uniform","normal","exponential"];

  var replicates = 1;
  var trainingReplicates = 1;
  var stimulis;
  var id=gup("id");
  id = id ? id : "EMPTY";
  var index = 1;
  var i;
  //currently all blocked effects. We'd potentially want some of these to be random.

  d3.select("#progress").html("Question 1/"+stimuli.length);
  return stimuli;
}

var participantData = [];
var rt;
var stimuli = makeStimuli(true);
var questionIndex = 0;

// 20 total vizzes means an alpha of 0.05

var vizWidth = 400;
var vizHeight = 300;
var margin = 40;
var markSize = 10;

//Exponential distribution
//unconstrained exponential

var x = d3.scaleBand().domain([0,1]).range([margin,vizWidth]).paddingOuter(0.2).paddingInner(0.1);
var y = d3.scaleLinear().domain([0,1]).range([vizHeight-margin,margin]);
var yAxis = d3.axisLeft(y).tickFormat(d3.format(".0%")).tickValues([0,1]);
/***
UI Functions
***/

//What happens when the participant clicks the ready button.
// The RT timer starts.
// The vis is drawn.
// The "Confirm" button becomes enabled.

var ready = function(){
  //You can't "ready" twice.
  d3.select("#readyBtn")
    .style("visibility","hidden")
    .attr("disabled","disabled");

  rt = new Date();
  makeVis(stimuli[questionIndex]);
};


/***
Draw Functions
***/

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
    .attr("stroke-width","4px");

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
    .attr("x", (d,i) => x(i)-2 + (x.bandwidth()/2))
    .attr("y",d => y(d))
    .attr("width","4px")
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
    .attr("stroke-width","4px");

  g.selectAll("rect").data(data).enter().append("rect")
    .attr("fill","url(#grad)")
    .attr("x", (d,i) => x(i)-2 + (x.bandwidth()/2))
    .attr("y",vizHeight-margin)
    .attr("width","4px")
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
    .attr("stroke-width","4px")
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
    .attr("stroke-width","4px")
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

var drawLabels = function(svg,data){
  //draw text showing the values directly above each mark
  svg.append("g").selectAll("text").data(data).enter().append("text")
    .attr("x",(d,i) => x(i) + (x.bandwidth()/2))
    .attr("text-anchor","middle")
    .attr("y" , d => y(d)-12)
    .text(d => d3.format(".0%")(d));
}

var drawTopLabels = function(svg,data){
  //draw text showing the values way at the top of the chart
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

function changeVisType(newViz,newParameter){
  //change the current vis that is in "#vis" to a different one, preserving whatever data was there.
  var makeViz = getVisFunction(newViz);
  var data = d3.select("svg").datum();
  d3.select("#vis").selectAll("*:not(.grad)").remove();
  makeViz(d3.select("svg"),data,newParameter);
}

function testVis(vizType){
  //make a vis of the current type in #vis, with random data.
  var makeViz = getVisFunction(vizType);
  d3.select("#vis").selectAll("*:not(.grad)").remove();
  makeViz(d3.select("svg"),dl.random.uniform(0,1).samples(5));
}

function testAll(){
  //periodically sample through all vis types, keeping an initial random set of data.
  var data = dl.random.uniform(0,1).samples(5);
  var index = 0;
  testVis(visTypes[index]);
  d3.interval(function(){
    index = (index+1) % visTypes.length;
    changeVisType(visTypes[index]);
  },1000);
}

function testAllGrid(){
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

//What happens when we "confirm" our selection.
//Get rid of the existing vizzes
//Increment the question num
//See if we were right
//See how long it took
//If it's the last question, go to the post test/wrap up screen
var answer = function(){
  var selected = d3.select(".selected");
  var right = selected.datum().flawed;
  var timestamp = new Date();
  rt = timestamp-rt;
  console.log("Correct?: "+right);
  participantData[questionIndex] = stimuli[questionIndex];
  participantData[questionIndex].correct = right ? "1" : "0";
  participantData[questionIndex].rt = rt;
  participantData[questionIndex].timestamp = timestamp.toString();
  participantData[questionIndex].vizIndex = selected.attr("id");

  d3.select("#vis").selectAll("*:not(.grad)").remove();

  writeAnswer(participantData[questionIndex]);
}

var writeAnswer = function(response) {
  //Called when we answer a question in the first task
  //XML to call out to a php script to store our data in a csv over in ./data/
  var writeRequest = new XMLHttpRequest();
  var writeString = "answer=" + JSON.stringify(response);
  writeRequest.open("GET", "data/writeJSON.php?" + writeString, true);
  writeRequest.setRequestHeader("Content-Type", "application/json");
  writeRequest.addEventListener("load", nextQuestion);
  writeRequest.send();
}

function gup(name) {
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
