var x = d3.scaleLinear().domain([0,1]).range([0,58]);
var y = x;

function makeSample(){
  var sample = d3.select("#sample");
  var icon = sample.append("svg")
  .classed("icon",true);

  icon.append("rect")
  .attr("x",1)
  .attr("y",1)
  .attr("width",58)
  .attr("height",28)
  .classed("fold",true);

  icon.append("rect")
  .attr("x",1)
  .attr("y",30)
  .attr("width",58)
  .attr("height",28)
  .classed("foldDash",true);

  icon = sample.append("svg")
  .classed("icon",true);

  icon.append("rect")
  .attr("x",1)
  .attr("y",1)
  .attr("width",58)
  .attr("height",28)
  .classed("fold",true);

  icon.append("rect")
  .attr("x",1)
  .attr("y",30)
  .attr("width",58)
  .attr("height",28)
  .classed("foldDash",true);

  icon.append("circle")
  .attr("cx", 15)
  .attr("cy",15)
  .attr("r",4)
  .classed("punch",true);

  icon = sample.append("svg")
  .classed("icon",true);

  icon.append("line")
  .attr("x1",0)
  .attr("x2",0)
  .attr("y1",0)
  .attr("y2",60)
  .attr("stroke-width","4px")
  .attr("stroke","#333");

  var answers = [
    [{"x":20,"y":10},{"x":10,"y":20}],
    [{"x":15,"y":15},{"x":45,"y":45}],
    [{"x":15,"y":15},{"x":15,"y":45}],
    [{"x":15,"y":45},{"x":45,"y":15}],
    [{"x":15,"y":15},{"x":45,"y":15}]
  ];

  answers.forEach(function(d){ drawAnswer(sample,d); return;});

}

function makeQuestions(){
  var answers = [
    [
      //q1 answers
      [{"x":10,"y":50},{"x":20,"y":40}],
      [{"x":20,"y":40},{"x":40,"y":40}],
      [{"x":20,"y":40},{"x":40,"y":20}],
      [{"x":20,"y":40},{"x":20,"y":20}],
      [{"x":20,"y":40}]
    ],
    [
      //q2 answers
      [{"x":10,"y":10},{"x":50,"y":10},{"x":10,"y":50},{"x":50,"y":50}],
      [{"x":10,"y":40},{"x":50,"y":40}],
      [{"x":25,"y":30},{"x":35,"y":30},{"x":25,"y":40},{"x":35,"y":40}],
      [{"x":10,"y":30},{"x":50,"y":30},{"x":10,"y":40},{"x":50,"y":40}],
      [{"x":20,"y":10},{"x":40,"y":10},{"x":20,"y":50},{"x":40,"y":50}]
    ],
    [
      //q3 answers
      [{"x":50,"y":10},{"x":50,"y":50}],
      [{"x":10,"y":10},{"x":50,"y":10}],
      [{"x":10,"y":10},{"x":50,"y":10},{"x":50,"y":30}],
      [{"x":50,"y":10},{"x":50,"y":30},{"x":50,"y":50}],
      [{"x":10,"y":10},{"x":50,"y":10},{"x":50,"y":50}]
    ],
    [
      //q4 answers
      [{"x":25,"y":10},{"x":35,"y":50}],
      [{"x":10,"y":10},{"x":50,"y":10},{"x":10,"y":50},{"x":50,"y":50}],
      [{"x":20,"y":10},{"x":40,"y":10},{"x":20,"y":50},{"x":40,"y":50}],
      [{"x":10,"y":20},{"x":20,"y":10},{"x":40,"y":50},{"x":50,"y":40}],
      [{"x":10,"y":20},{"x":20,"y":10},{"x":40,"y":50},{"x":50,"y":40},{"x":10,"y":35},{"x":25,"y":50}]
    ],
    [
      //q5 answers
      [{"x":40,"y":25},{"x":50,"y":10}],
      [{"x":40,"y":25},{"x":50,"y":10},{"x":40,"y":35},{"x":50,"y":50}],
      [{"x":40,"y":25},{"x":40,"y":35},{"x":50,"y":50}],
      [{"x":40,"y":25},{"x":40,"y":35}],
      [{"x":35,"y":35},{"x":50,"y":50}]
    ],
    [
      //q6 answers
      [{"x":10,"y":10},{"x":20,"y":20},{"x":40,"y":20},{"x":50,"y":10}],
      [{"x":15,"y":15},{"x":15,"y":45}],
      [{"x":45,"y":15},{"x":45,"y":45}],
      [{"x":15,"y":15},{"x":45,"y":45}],
      [{"x":15,"y":45},{"x":45,"y":45}]
    ],
    [
      //q7 answers
      [{"x":25,"y":10},{"x":35,"y":10},{"x":10,"y":25},{"x":10,"y":35}],
      [{"x":10,"y":25},{"x":10,"y":35}],
      [{"x":35,"y":10},{"x":10,"y":35}],
      [{"x":35,"y":10},{"x":10,"y":35},{"x":10,"y":25}],
      [{"x":25,"y":10},{"x":10,"y":35},{"x":10,"y":25}]
    ],
    [
      //q8 answers
      [{"x":22.5,"y":22.5},{"x":37.5,"y":37.5}],
      [{"x":10,"y":10},{"x":50,"y":50}],
      [{"x":22.5,"y":22.5},{"x":37.5,"y":37.5},{"x":10,"y":10},{"x":50,"y":50}],
      [{"x":10,"y":30},{"x":20,"y":20},{"x":30,"y":10}],
      [{"x":10,"y":10},{"x":10,"y":30},{"x":37.5,"y":30}]
    ],
    [
      //q9 answers
      [{"x":22.5,"y":22.5},{"x":37.5,"y":37.5}],
      [{"x":20,"y":10},{"x":10,"y":20},{"x":50,"y":25},{"x":50,"y":35}],
      [{"x":10,"y":25},{"x":50,"y":25},{"x":10,"y":35},{"x":50,"y":35}],
      [{"x":40,"y":10},{"x":50,"y":20}],
      [{"x":10,"y":20},{"x":20,"y":10}]
    ],
    [
      //q10 answers
      [{"x":22.5,"y":37.5}],
      [{"x":22.5,"y":37.5},{"x":10,"y":50}],
      [{"x":22.5,"y":37.5},{"x":50,"y":50},{"x":10,"y":10}],
      [{"x":22.5,"y":37.5},{"x":37.5,"y":22.5}],
      [{"x":22.5,"y":37.5},{"x":37.5,"y":22.5},{"x":52.5,"y":7.5}]
    ],
    [
      //q11 answers
      [{"x":15,"y":15},{"x":45,"y":15}],
      [{"x":15,"y":15},{"x":45,"y":45}],
      [{"x":15,"y":45},{"x":45,"y":15}],
      [{"x":15,"y":45},{"x":45,"y":45}],
      [{"x":45,"y":15},{"x":45,"y":45}]
    ],
    [
      //q12 answers
      [{"x":50,"y":10},{"x":10,"y":50}],
      [{"x":10,"y":10},{"x":50,"y":10},{"x":10,"y":50},{"x":50,"y":50}],
      [{"x":10,"y":50},{"x":50,"y":50}],
      [{"x":10,"y":10},{"x":10,"y":50}],
      [{"x":10,"y":10},{"x":10,"y":50},{"x":50,"y":50}]
    ],
    [
      //q13 answers
      [{"x":45,"y":10},{"x":45,"y":30},{"x":45,"y":50}],
      [{"x":15,"y":10},{"x":15,"y":30},{"x":15,"y":50}],
      [{"x":45,"y":20},{"x":45,"y":40}],
      [{"x":10,"y":30},{"x":30,"y":30},{"x":50,"y":30}],
      [{"x":15,"y":30},{"x":45,"y":30}]
    ],
    [
      //q14 answers
      [{"x":15,"y":15},{"x":45,"y":15},{"x":15,"y":45},{"x":45,"y":45}],
      [{"x":30,"y":45},{"x":45,"y":30}],
      [{"x":15,"y":30},{"x":45,"y":30}],
      [{"x":15,"y":45},{"x":45,"y":15}],
      [{"x":15,"y":30},{"x":45,"y":30},{"x":30,"y":15},{"x":30,"y":45}]
    ],
  ];

  answers.forEach(function(q,i){
    var sample = d3.select("body").append("div").classed("question",true);

    sample.append("div")
      .style("padding-top","25px")
      .style("width","50px")
      .text("Q"+(i+1));

    var icon = sample.append("svg")
    .classed("icon",true);

    icon.append("line")
    .attr("x1",0)
    .attr("x2",0)
    .attr("y1",0)
    .attr("y2",60)
    .attr("stroke-width","4px")
    .attr("stroke","#333");
    q.forEach(function(d){
      drawAnswer(sample,d);
    });
  });
}

function drawAnswer(parent,dots){
  var icon = parent.append("svg")
  .classed("icon",true)
  .classed("answer",true);

  icon.append("rect")
  .attr("x",1)
  .attr("y",1)
  .attr("width",58)
  .attr("height",58)
  .classed("fold",true);

  icon.selectAll("circle").data(dots).enter().append("circle")
    .attr("cx",d=>d.x)
    .attr("cy",d=>d.y)
    .attr("r",3)
    .classed("punch",true);
}

makeSample();
