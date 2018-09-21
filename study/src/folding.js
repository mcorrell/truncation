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

  icon = sample.append("svg")
  .classed("icon",true)
  .classed("answer",true);

  icon.append("rect")
  .attr("x",1)
  .attr("y",1)
  .attr("width",58)
  .attr("height",58)
  .classed("fold",true)


  icon.append("circle")
  .attr("cx", 20)
  .attr("cy",10)
  .attr("r",4)
  .classed("punch",true);

  icon.append("circle")
  .attr("cx", 10)
  .attr("cy",20)
  .attr("r",4)
  .classed("punch",true);

  icon = sample.append("svg")
  .classed("icon",true)
  .classed("answer",true);

  icon.append("rect")
  .attr("x",1)
  .attr("y",1)
  .attr("width",58)
  .attr("height",58)
  .classed("fold",true)


  icon.append("circle")
  .attr("cx", 15)
  .attr("cy",15)
  .attr("r",4)
  .classed("punch",true);

  icon.append("circle")
  .attr("cx", 45)
  .attr("cy",45)
  .attr("r",4)
  .classed("punch",true);

  icon = sample.append("svg")
  .classed("icon",true)
  .classed("answer",true);

  icon.append("rect")
  .attr("x",1)
  .attr("y",1)
  .attr("width",58)
  .attr("height",58)
  .classed("fold",true)


  icon.append("circle")
  .attr("cx", 15)
  .attr("cy",15)
  .attr("r",4)
  .classed("punch",true);

  icon.append("circle")
  .attr("cx", 15)
  .attr("cy",45)
  .attr("r",4)
  .classed("punch",true);

  icon = sample.append("svg")
  .classed("icon",true)
  .classed("answer",true);

  icon.append("rect")
  .attr("x",1)
  .attr("y",1)
  .attr("width",58)
  .attr("height",58)
  .classed("fold",true)


  icon.append("circle")
  .attr("cx", 45)
  .attr("cy",15)
  .attr("r",4)
  .classed("punch",true);

  icon.append("circle")
  .attr("cx", 15)
  .attr("cy",45)
  .attr("r",4)
  .classed("punch",true);

  icon = sample.append("svg")
  .classed("icon",true)
  .classed("answer",true);

  icon.append("rect")
  .attr("x",1)
  .attr("y",1)
  .attr("width",58)
  .attr("height",58)
  .classed("fold",true)


  icon.append("circle")
  .attr("cx", 15)
  .attr("cy",15)
  .attr("r",4)
  .classed("punch",true);

  icon.append("circle")
  .attr("cx", 45)
  .attr("cy",15)
  .attr("r",4)
  .classed("punch",true);

}

function q1(){
  
}

makeSample();
