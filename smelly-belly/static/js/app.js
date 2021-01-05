// load samples.json with d3 library
var samples = "";

d3.json("smelly-belly/samples.json").then((data) => {
    samples = data;
    // // add option for each client in dropdown menu
    d3.select("#selDataset").selectAll("option")
        .data(data.metadata)
        .enter()
        .append("option")
        .classed(data.metadata.id, true)
        .html(function(d) {
            return d.id;
    });

    // initialized bar graph 
    var patientID = data.names[0];
    var index = data.samples.map((e) => e.id).indexOf(patientID);

    var x = [];
    var y = [];
    var text = [];

    for (var i = 0; i < 10; i++) {
        x.push(data.samples[index].sample_values[i]);
        y.push(data.samples[index].otu_ids[i]);
        text.push(data.samples[index].otu_labels[i]);
    };

    var trace1 = {
        x: x.reverse(),
        y: y.reverse().map((id) => `OTU ${id}`),
        type: 'bar',
        orientation: 'h',
        text: text.reverse()
    };

    var woop = [trace1];
    var layout = {
        title: `Top Ten OTUs found in Patient ${patientID}`,
        xaxis: {title: "Sample Values"},
        yaxis: {title: "OTU IDs"}
    };

    Plotly.newPlot("bar", woop, layout);

    // initialized bubble chart
    var bubbleX = data.samples[index].otu_ids;
    var bubbleY = data.samples[index].sample_values;
    var sizes = data.samples[index].sample_values;
    var colors = data.samples[index].otu_ids;
    var bubbleText = data.samples[index].otu_labels;
    
    var trace2 = {
        x: bubbleX,
        y: bubbleY,
        mode: 'markers',
        text: bubbleText,
        marker: {
            size: sizes,
            color: colors
        }
    };

    var data2 = [trace2];

    var layout2 = {
        title: `Bubble Chart of OTUs found in Patient ${patientID}`,
        xaxis: {title: "OTU ID"},
        yaxis: {title: "Sample Values"}
    };
    
    Plotly.newPlot("bubble", data2, layout2);

    // display individual's demographic information
    var informationPanel = d3.select("#sample-metadata");
    var information = data.metadata[index];
    
    Object.entries(information).forEach(([key, value]) => {
        informationPanel
            .append("p")
            .html(`${key}: ${value}`)
    });

    // display gauge chart for scrubs per week
    var scrubFrequency = data.metadata[index].wfreq;

    var trace3 = {
          domain: { x: [0, 1], y: [0, 1]},
          value: scrubFrequency,
          title: { 
            text: "<b>Belly Button Washing Frequency</b> <br>Scrubs Per Week",
            font: {size: 18}},
          type: "indicator",
          mode: "gauge+number",
          gauge: {
            axis: {range: [0, 9]},
            steps: [
              {range: [0, 1], color: "rgb(247, 243, 236)"},
              {range: [1, 2], color: "rgb(244, 241, 230)"},
              {range: [2, 3], color: "rgb(233, 230, 204)"},
              {range: [3, 4], color: "rgb(230, 231, 182)"},
              {range: [4, 5], color: "rgb(216, 228, 162)"},
              {range: [5, 6], color: "rgb(187, 203, 150)"},
              {range: [6, 7], color: "rgb(150, 190, 139)"},
              {range: [7, 8], color: "rgb(147, 185, 145)"},
              {range: [8, 9], color: "rgb(142, 178, 140)"}],
            bar: {color: "rgb(58, 119, 175"}
        },
        number: {font: {
            color: "rgb(58, 119, 175",
            family: "Arial"}}
    };

    var data3 = [trace3];  
    var layout3 = { 
        width: 600, 
        height: 450, 
        margin: { t:0, b: 0 }     
    };

    Plotly.newPlot('gauge', data3, layout3);
});

function optionChanged(patientID) {
    console.log(patientID);
    
    // update patient information
    var patientID = patientID;
    var index = samples.samples.map((e) => e.id).indexOf(patientID);

    var informationPanel = d3.select("#sample-metadata");
    var information = samples.metadata[index];

    // reassign new value of number of scrubs to variable for gauge chart
    var scrubFrequency = samples.metadata[index].wfreq;
    
    // create variable for number of OTUs in current patient
    var numOTUs = samples.samples[index].otu_ids.length;

    var x = [];
    var y = [];
    var text = [];
    var bubbleX = samples.samples[index].otu_ids;
    var bubbleY = samples.samples[index].sample_values;
    var updateMarker = {marker: 
        {size: samples.samples[index].sample_values, 
        color: samples.samples[index].otu_ids}};
    var bubbleText = samples.samples[index].otu_labels;

    
    // in case that there are less than 10 OTUs for bar chart
    switch(true) {
        case (numOTUs < 10):
            for (var i = 0; i < numOTUs; i++) {
                x.push(samples.samples[index].sample_values[i]);
                y.push(samples.samples[index].otu_ids[i]);
                text.push(samples.samples[index].otu_labels[i]);
            };
            break;
        default:
            for (var i = 0; i < 10; i++) {
                x.push(samples.samples[index].sample_values[i]);
                y.push(samples.samples[index].otu_ids[i]);
                text.push(samples.samples[index].otu_labels[i]);
            };
            break;
    };

    x = x.reverse();
    y = y.reverse().map((id) => `OTU ${id}`);
    text = text.reverse();

    var updateBar = {
        title: `Top Ten OTUs found in Patient ${patientID}`
    }
    var updateBubble = {
        title: `Bubble Chart of OTUs found in Patient ${patientID}`
    }

    // restyle bar chart
    Plotly.restyle("bar", "x", [x]);
    Plotly.restyle("bar", "y", [y]);
    Plotly.restyle("bar", "text", [text]);
    Plotly.relayout("bar", updateBar);

    // restyle bubble chart
    Plotly.restyle("bubble", "x", [bubbleX]);
    Plotly.restyle("bubble", "y", [bubbleY]);
    Plotly.restyle("bubble", "text", [bubbleText]);
    Plotly.restyle("bubble", updateMarker);
    Plotly.relayout("bubble", updateBubble);

    // restyle gauge chart
    Plotly.restyle("gauge", "value", [scrubFrequency]);

    
    // update demographic information by removing old and adding new 
    d3.selectAll("p").remove();
    Object.entries(information).forEach(([key, value]) => {
        informationPanel
            .append("p")
            .text(`${key}: ${value}`)
    });
};