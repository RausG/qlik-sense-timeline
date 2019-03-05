// Hacked together aimlessly by Kai Hilton-Jones
// Improved by Tim Payne
// Improved by Florian Käfert - 2017-05-18

require.config({
	paths : {
		//create alias to plugins
		async : '/extensions/googtimeline/async',
		goog : '/extensions/googtimeline/goog',
		propertyParser : '/extensions/googtimeline/propertyParser',
	}
});
define(["jquery", "moment", 'goog!visualization,1,packages:[corechart,table,timeline]'], function($, moment) {'use strict';
	
	var palette = [
			"#b0afae",
			"#7b7a78",
			"#545352",
			"#4477aa",
			"#7db8da",
			"#b6d7ea",
			"#46c646",
			"#f93f17",
			"#ffcf02",
			"#276e27",
			"#ffffff",
			"#000000"
		];

	return {
		initialProperties : {
			version : 1.4,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 5,
					qHeight : 500
				}]
			},
			chartType : "timeline",
			showRowLabels : true,
			showBarLabels : true,
			tooltipIsHTML : false,
			showTooltip : true,
			groupByRowLabel : true,
			colorByRowLabel : false,
			useSingleColor : false,
			useQlikColor : false,
			reverseData : false,
			useBackgroundColor : false
		},
		//property panel
		definition : {
			type : "items",
			component : "accordion",
			items : {
				dimensions : {
					uses : "dimensions",
					min : 1,
					max : 2
				},
				measures : {
					uses : "measures",
					min : 2,
					max : 3
				},
				sorting : {
					uses : "sorting"
				},
				settings : {
					uses : "settings",
					items : 
					{
						labels: {
                            type: "items",
                            label: "Labels",
                            items: {
								showRowLabels: {
									type : "boolean",
									component : "switch",
									label : "Row Labels",
									ref : "showRowLabels",
									options : [{ value : true, translation : "properties.on" },{ value : false, translation : "properties.off" }]
								},
								showBarLabels: {
									type : "boolean",
									component : "switch",
									label : "Bar Labels",
									ref : "showBarLabels",
									options : [{ value : true, translation : "properties.on" },{ value : false, translation : "properties.off" }]
								}
                            }
                        },
						tooltip: {
                            type: "items",
                            label: "Tooltip",
                            items: {
								showTooltip: {
									type : "boolean",
									component : "switch",
									label : "Show Tooltip",
									ref : "showTooltip",
									options : [{ value : true, translation : "properties.on" },{ value : false, translation : "properties.off" }],
								},
								tooltipIsHTML: {
									type : "boolean",
									component : "switch",
									label : "Tooltip is HTML",
									ref : "tooltipIsHTML",
									options : [{ value : true, translation : "properties.on" },{ value : false, translation : "properties.off" }],
									show: function (e) { return e.qHyperCubeDef.qMeasures.length == 3 && e.showTooltip; }
								}
							}
						},
						group: {
                            type: "items",
                            label: "Grouping",
                            items: {
								groupByRowLabel: {
									type : "boolean",
									component : "switch",
									label : "Group by 1st Dimension",
									ref : "groupByRowLabel",
									options : [{ value : true, translation : "properties.on" },{ value : false, translation : "properties.off" }]
								}
							}
						},
						color: {
                            type: "items",
                            translation: "properties.color",
                            items: {
								useBackgroundColor: {
									type : "boolean",
									component : "switch",
									label : "Background color",
									ref : "useBackgroundColor",
									options : [{ value : true, translation : "properties.on" },{ value : false, translation : "properties.off" }],
								},
								backgroundColor: {
									component : "color-picker",
									translation: "properties.color",
									ref : "backgroundColor",
									type: "integer",
									defaultValue: '#ffffff',
									show: function (e) { return e.useBackgroundColor }
								},
								useSingleColor: {
									type : "boolean",
									component : "switch",
									label : "Single color",
									ref : "useSingleColor",
									options : [{ value : true, translation : "properties.on" },{ value : false, translation : "properties.off" }]
								},
								singleColor: {
									component : "color-picker",
									translation: "properties.color",
									ref : "singleColor",
									type: "integer",
									defaultValue: '#46c646',
									show: function (e) { return e.useSingleColor }
								},
								colorByRowLabel: {
									type : "boolean",
									component : "switch",
									label : "Color by row label",
									ref : "colorByRowLabel",
									show: function (e) { return e.qHyperCubeDef.qDimensions.length > 1 && !e.useSingleColor; },
									options : [{ value : true, translation : "properties.on" },{ value : false, translation : "properties.off" }]
								},
								useQlikColor: {
									type : "boolean",
									component : "switch",
									label : "Palette",
									ref : "useQlikColor",
									options : [{ value : true, label : "Qlik 10" },{ value : false, label : "Google" }],
									show: function (e) { return !e.useSingleColor }
								}
							}
						}
					}
				}
			}
		},
		support: {
			snapshot: false,
			export: false,
			exportData: true
		},
		
		paint : function($element, layout) {
			
			var self = this;
			
			var elemNos = [];
			var dCnt = this.backendApi.getDimensionInfos().length;
			var mCnt = this.backendApi.getMeasureInfos().length;
			var rowCnt = this.backendApi.getRowCount();
			
			// Get DateFormat from Qlik
			var dateFormat = this.backendApi.localeInfo.qDateFmt;
			var timestampFormat = this.backendApi.localeInfo.qTimestampFmt;
			
			// Build DataTable
			var data = new google.visualization.DataTable();
			
			data.addColumn  ({ type: 'string', id: 'Label' });
			if(dCnt == 2) { data.addColumn({ type: 'string', id: 'Name' }); };
			if(mCnt == 3) { data.addColumn({ type: 'string', role: 'tooltip', p: {html: layout.tooltipIsHTML}}); };
			data.addColumn  ({ type: 'date', id: 'Start' });
        	data.addColumn  ({ type: 'date', id: 'End' });
			
			 // Copy Dimensions and Measures to DataTable
			
			this.backendApi.eachDataRow(function(rowNo, row) {
				
				var values = [];
				var cellCnt = row.length;
				
				// Dim 1 - Row Label
				values.push(row[0].qText);

				// Dim 2 - Bar Label
				if(dCnt == 2) { values.push(row[1].qText); };

				// Mes 3 - Tooltip
				if(mCnt == 3) { values.push(row[cellCnt - 1].qText); };

				// Mes 1 - Start time
				var start = moment(row[cellCnt - 2].qText, timestampFormat);
				values.push(start.toDate());
				
				// Mes 2 - End time
				var end = moment(row[cellCnt - 1].qText, timestampFormat);
				values.push(end.toDate());
				
				// Add values to data
				data.addRows([values]);
				
				//selections will always be on first dimension
				elemNos.push(row[0].qElemNumber);
			});
			
			//Create options-object
			var options = {
				avoidOverlappingGridLines: true,
				backgroundColor: (layout.useBackgroundColor) ? layout.backgroundColor.color : layout.backgroundColor.defaultValue,
				colors: (layout.useQlikColor) ? palette : null,
				enableInteractivity: true,
				fontName: 'Arial',
				fontSize: 'automatic',
				timeline: {
					barLabelStyle: {fontName: null, fontSize: null},
					colorByRowLabel: layout.colorByRowLabel,
					groupByRowLabel: layout.groupByRowLabel,
					rowLabelStyle: {color: null, fontName: null, fontSize: null},
					showBarLabels: layout.showBarLabels,
					showRowLabels: layout.showRowLabels,
					singleColor: (layout.useSingleColor) ? layout.singleColor.color : null,
				},
				tooltip: {
					isHtml: true,
					trigger: (layout.showTooltip) ? 'focus' : 'none'
				},
				redrawTrigger : null
			};
			
			//Instantiating and drawing the chart
			var chart = new google.visualization.Timeline($element[0]);
			chart.draw(data, options);
			
			//Selections
			google.visualization.events.addListener(chart, 'select', selectHandler);
			
			//Handle Selections
			function selectHandler(e) {
				var selections = [];
				var chartSel = chart.getSelection();
				
				selections[0] = elemNos[chartSel[0].row];
				self.selectValues(0, selections, true);
			};
			
			return qlik.Promise.resolve();
		}
	};

});
