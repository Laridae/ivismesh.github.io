var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

var i = 0,
    duration = 750,
    root;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([0.5, 8])
    .on("zoom", zoomed);

var svg = d3.select("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
	.call(zoom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function zoomed(){
	var tx = Math.min(150, d3.event.translate[0]),
		//ty = Math.min(0, d3.event.translate[1]);
		ty = d3.event.translate[1];
	svg.attr("transform", "translate(" + [tx, ty] + ")scale(" + d3.event.scale + ")");
}



d3.json("data.json", function(error, data) {
  if (error) throw error;

  root = data;
  root.x0 = height / 2;
  root.y0 = 0;

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  root.children.forEach(collapse);
  update(root);
  
  addresses = [];
});





d3.select(self.frameElement).style("height", "800px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })
	  .attr("opacity", function(d) {if(d.depth === 0) return 0; else return 1;});		//Hide first level.

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6)
	  .attr("opacity", function(d) {if(d.depth === 0) return 0; else return 1;});		//Hide first level.

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
	  .attr("opacity", function(d) {if(d.source.depth === 0) return 0; else return 1;}) //Hides first level.
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
  
}





// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
  console.log("click function done");
}





function expand(root) {
	
	var current = root;
	
	//Each address.
	for(var i = 0; i < addresses.length; i++) {
		var path = addresses[i].split(".");
		var treeletter = path[0].slice(0,1);
		
		//Get the correct tree.
		var tree;
		for(var j = 0; j < root.children.length; j++) {
			if(root.children[j].address === treeletter) tree = root.children[j];
		}
		
		//The current node is the first node in a tree.
		current = tree;
		
		console.log("Tree: " + treeletter);
		console.log("Path: " + path);
		
		//The path to each node in the path.
		//If the path is A.B.C then the nodes have paths
		//A, A.B and A.B.C.
		var nodesPaths = [];
		for(var j = 0; j < path.length; j++) {
			nodesPaths.push(path.slice(0, j+1).join("."));
		}
		
		console.log("Paths: ");
		console.log(nodesPaths);
		
		//Follow the path. At each node simulate a click.
		for(var j = 0; j < nodesPaths.length; j++) {
			console.log("Current node: " + current.name);
			
			//The path to the next node.
			var pathToNextNode = nodesPaths[j];
			
			//console.log("Path to next node: " + nodesPaths[j]);
			
			if(current._children != null) {
				//Hidden children. Look for a child with the correct path.
				
				for(var n = 0; n < current._children.length; n++) {
					if(current._children[n].address === nodesPaths[j]) {
						console.log("Next node: " + current._children[n].name);
						//Save the node to click.
						var nodeToClick = current;
						//Change current node to the correct child.
						current = current._children[n];
						//Click the previously current node.
						click(nodeToClick);
						break;
					}
				}
				
			} else if(current.children != null) {
				//Non hidden children. Look for a child with the correct path but don't click.
				
				for(var n = 0; n < current.children.length; n++) {
					if(current.children[n].address === nodesPaths[j]) {
						console.log("Next node (b): " + current.children[n].name);
						//Change current node to the correct child.
						current = current.children[n];
						break;
					}
				}
			}
		}
	}
}





function searchTree(node, searchText) {
	
	if(node.children != null) {
		//console.log(node.children.length);
		for(var i = 0; i < node.children.length; i++) {
			searchTree(node.children[i]);
			//console.log(node.children[i]);
		}
	} else if(node._children != null) {
		for(var i = 0; i < node._children.length; i++) {
			searchTree(node._children[i]);
			//console.log(node.children[i]);
		}
	}
	if(node.name === searchText) {
		addresses.push(node.address);
		//console.log(node);
	}
	return;
}





function search() {
	
	var searchText = $("#searchText").value;
	
	console.log("Search: " + searchText);
	
	searchTree(root, searchText);
	console.log(addresses);
	
	expand(root);
}