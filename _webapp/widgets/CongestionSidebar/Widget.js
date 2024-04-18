//javascript for controlling WFRC Congestion Map
//written by Bill Hereth Octoboer 2020


/* Green to Red Gradiant Ramp - 5 Steps with grey as 0 */
var sCVCGrad0 = "#EEEEEE";
var sCVCGrad1 = "#00FF00";
var sCVCGrad2 = "#A9F36A";
var sCVCGrad3 = "#FFE469";
var sCVCGrad4 = "#FF0000";
var sCVCGrad5 = "#730000";

aCGrYl = ["#00FF00","#AAED46","#D5E958","#FFE469"];
aCReds = ["#FF4D4D","#E64545","#CC3E3E","#B33636","#992E2E","#802727","#661F1F","#4C1717","#330F0F","#1A0808"];//,"000000"]; gradient is 11 red to black, but last black removed.
sCBlack = "#000000"

aColorRanges = [-0.1,0.699,0.799,0.899,0.999,1.099,1.199,1.299,1.399,1.499,1.599,1.699,1.799,1.899,1.999,100]

var sSelectionColor = "#FF69B4";
//Color Ramps
//var aCR_VCGrad7  = new Array(sCVCGrad1,sCVCGrad2,sCVCGrad3,sCVCGrad4,sCVCGrad5,sCVCGrad6,sCVCGrad7);

//Line Widths
//var dLineWidth0 = 0.1;
//var dLineWidth1 = 0.7;
//var dLineWidth2 = 1.7;
//var dLineWidth3 = 2.7;
//var dLineWidth4 = 3.7;
//var dLineWidth5 = 4.7;
//var dLineWidth6 = 5.7;
//var dLineWidth7 = 6.7; 

var cW; //congestion widget

var lyrCongestion;
var lyrSegments;
var sCongestionLayerName = 'Congestion';
var sSegmentLayerName = 'Master_Segs';

var sScenario = "RTP50";
var sSeason   = "Ann";
var sDOWPeak  = "WkPM";
var sVCGroup   = "FalWkPM";

var vcLayers = [];

var aVCValues = [];
var aVCValuesByColor = [];

var g_sSegID = '';

var iFirst = true;

var cChartOne;

iPixelSelectionTolerance = 5;

var iCount = 0;
var bIndivMonthSelected = false;
var sMonthSelected = "";

var sInterval = "Prd";
var sIntervalLabel = "Period";
//var curPeak = "PeakPeriod";

var sDetailsButtonExpanded  = "&#9660 Calculation Details"; //Settings button text with up arrow
var sDetailsButtonCollapsed = "&#9658 Calculation Details"; //Settings button text with down arrow
var sTbodyHide = "none"; //html for hiding a <tbody>
var sTbodyShow = "table-row-group"; //html for showing a <tbody>
var sBlockHide = "none"; //html for hiding a <div>
var sBlockShow = "block"; //html for showing a <div>
var sTbodyHide = "none"; //html for hiding a <tbody>
var sTbodyShow = "table-row-group"; //html for showing a <tbody>

define(['dojo/_base/declare',
    'jimu/BaseWidget',
    'dijit/registry',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/query',
    'dijit/dijit',
    'dojox/charting/Chart',
    'dojox/charting/plot2d/StackedColumns',
    'dojox/charting/widget/Legend',
    'dojox/charting/action2d/Tooltip',
    'dijit/form/TextBox',
    'jimu/LayerInfos/LayerInfos',
    'esri/tasks/query',
    'esri/tasks/QueryTask',
    'esri/layers/FeatureLayer',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleFillSymbol',
    'esri/Color',
    'esri/map',
    'esri/renderers/ClassBreaksRenderer',
    'esri/geometry/Extent',
    'dojo/store/Memory',
    'dojox/charting/StoreSeries',
    'dijit/Dialog',
    'dijit/form/Button',
    'dijit/form/RadioButton',
    'dijit/form/MultiSelect',
    'dojox/form/CheckedMultiSelect',
    'dijit/form/Select',
    'dijit/form/ComboBox',
    'dijit/form/CheckBox',
    'dojo/store/Observable',
    'esri/renderers/UniqueValueRenderer',
    'esri/renderers/SimpleRenderer',
    'dojo/cookie',
    'esri/lang',
    'jimu/utils',
    'dijit/place',
    'dojox/charting/axis2d/Default',
    'dojo/domReady!'],
function(declare,
         BaseWidget,
         registry,
         dom,
         domStyle,
         djQuery,
         dijit,
         Chart,
         StackedColumns,
         Legend,
         Tooltip,
         TextBox,
         LayerInfos,
         Query,
         QueryTask,
         FeatureLayer,
         SimpleLineSymbol,
         SimpleFillSymbol,
         Color,
         Map,
         ClassBreaksRenderer,
         Extent,
         Memory,
         StoreSeries,
         Dialog,
         Button,
         RadioButton,
         MutliSelect,
         CheckedMultiSelect,
         Select,
         ComboBox,
         CheckBox,
         Observable,
         UniqueValueRenderer,
         SimpleRenderer,
         cookie,
         esriLang,
         jimuUtils,
         Place) {
  //To create a widget, you need to derive from BaseWidget.
  
  return declare([BaseWidget], {
    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,

    baseClass: 'jimu-widget-demo',
    
    postCreate: function() {
      this.inherited(arguments);
      console.log('postCreate');
    },

    startup: function() {
      console.log('startup');
      
      this.inherited(arguments);
      this.map.setInfoWindowOnClick(false); // turn off info window (popup) when clicking a feature
      
      var parent = this;
      cW = this; //congestion Widget
      
      //Initialize Layers
      var layerInfosObject = LayerInfos.getInstanceSync();
      for (var j=0, jl=layerInfosObject._layerInfos.length; j<jl; j++) {
        var currentLayerInfo = layerInfosObject._layerInfos[j];    
        if (currentLayerInfo.title == sCongestionLayerName) { //must mach layer title
          lyrCongestion = layerInfosObject._layerInfos[j].layerObject;
        }
        else if (currentLayerInfo.title == sSegmentLayerName) { //must mach layer title
          lyrSegments = layerInfosObject._layerInfos[j].layerObject;
        }
      }
      
      ////peak period/hour radio button
      //dom.byId("rbPeakPeriod").onchange = function(isChecked){
      //  if(isChecked){
      //    curPeak = this.value; //"Prd"
      //    cW.updateVCGroup();
      //  }
      //};
      //
      ////peak period/hour radio button
      //dom.byId("rbPeakHour").onchange = function(isChecked){
      //  if(isChecked){
      //    curPeak = ""; //peak hour is default, so code does not include "Hr"
      //    cW.updateVCGroup();
      //  }
      //};

      //peak period/hour radio button
      dom.byId("cmbInterval").onchange = function(){
        sIntervalLabel = this[this.selectedIndex].label;
        sInterval = this.value;
        cW.updateVCGroup();
      };

      //Get Scenarios
      dojo.xhrGet({
        url: "widgets/CongestionSidebar/data/scenarios.json",
        handleAs: "json",
        load: function(obj) {
          /* here, obj will already be a JS object deserialized from the JSON response */
          console.log('scenarios.json');
          scenarios = obj;
          cmbScenario = new Select({
            options: scenarios,
            onChange: function() {
              sScenario = this.value;
              cW.updateScenario();
            }
          }, "cmbScenario");
          cmbScenario.startup();
          cmbScenario.set("value",sScenario);
          cW.populateScenarios();
          //cW.initializeChart();
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });

      //Get Seasons
      dojo.xhrGet({
        url: "widgets/CongestionSidebar/data/vcgroups_seasons.json",
        handleAs: "json",
        load: function(obj) {
          /* here, obj will already be a JS object deserialized from the JSON response */
          console.log('vcgroups_seasons.json');
          seasons = obj;
          //cmbSeason = new Select({
          //  options: seasons,
          //  onChange: function() {
          //    sSeason = this.value;
          //    cW.updateVCGroup();
          //  }
          //}, "cmbSeason");
          //cmbSeason.startup();
          //cmbSeason.set("value",sSeason);
          cW.createSeasonsRadioButtons();
          cW.updateVCGroup();
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });

      
      //Get Peak Periods
      dojo.xhrGet({
        url: "widgets/CongestionSidebar/data/vcgroups_dowpeaks.json",
        handleAs: "json",
        load: function(obj) {
          /* here, obj will already be a JS object deserialized from the JSON response */
          console.log('vcgroups_dowpeaks.json');
          dowpeaks = obj;
          //cmbDOWPeak = new Select({
          //  options: dowpeaks,
          //  onChange: function() {
          //    sDOWPeak = this.value;
          //    cW.updateVCGroup();
          //  }
          //}, "cmbDOWPeak");
          //cmbDOWPeak.startup();
          //cmbDOWPeak.set("value",sDOWPeak);
          cW.createDOWPeakRadioButtons();
          cW.updateVCGroup();
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });
      
      //Get Segment Details
      dojo.xhrGet({
        url: "widgets/CongestionSidebar/data/segmentdetails.json",
        handleAs: "json",
        load: function(obj) {
          /* here, obj will already be a JS object deserialized from the JSON response */
          console.log('segmentdetails.json');
          segmentdetails = obj;
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });
      
      //Get Forecast Details
      dojo.xhrGet({
        url: "widgets/CongestionSidebar/data/forecastdetails.json",
        handleAs: "json",
        load: function(obj) {
          /* here, obj will already be a JS object deserialized from the JSON response */
          console.log('forecastdetails.json');
          forecastdetails = obj;
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });      
      //SETUP MAP CLICK EVENT

      cW.map.on('click', selectFeatures);

      function pointToExtent(map, point, toleranceInPixel) {
        var pixelWidth = cW.map.extent.getWidth() / cW.map.width;
        var toleranceInMapCoords = toleranceInPixel * pixelWidth;
        return new Extent(point.x - toleranceInMapCoords,
          point.y - toleranceInMapCoords,
          point.x + toleranceInMapCoords,
          point.y + toleranceInMapCoords,
          cW.map.spatialReference);
      }
      
      //Setup Function for Selecting Features and Opening Widgets

      function selectFeatures(evt) {
        var query = new Query();
        query.geometry = pointToExtent(map, evt.mapPoint, iPixelSelectionTolerance);
        query.returnGeometry = false;
        query.outFields = ["*"];
        //var deferredSegment = layerSegment.selectFeatures(query, FeatureLayer.SELECTION_NEW);
        //var deferredIntersection = layerIntersection.selectFeatures(query, FeatureLayer.SELECTION_NEW);
        
        lyrCongestion = cW.getCurrentVCLayer();

        var queryTaskSeg = new QueryTask(lyrCongestion.url);
        
        //Clear Selection
        lyrCongestion.clearSelection();
        cW.map.infoWindow.clearFeatures();
        g_sSegID = '';
        
        //execute query
        queryTaskSeg.execute(query,showResults);
        
        //search results
        function showResults(results) {
          console.log('showResults');
          var resultCount = results.features.length;
          //only use first result
          if (resultCount>=1) {
            var featureAttributes = results.features[0].attributes;
            g_sSegID = featureAttributes['SEGID'];
            console.log(g_sSegID);

            var queryseg = new Query();  
            queryseg.returnGeometry = false;
            queryseg.where = "SEGID='" + g_sSegID + "'";
            queryseg.outFields = ["*"];
            var selectSeg = lyrCongestion.selectFeatures(queryseg, FeatureLayer.SELECTION_NEW);
            cW.map.infoWindow.lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(sSelectionColor), 3);
            cW.map.infoWindow.setFeatures([selectSeg]);

            //Update chart
            cW.showSegData();
            cW.getVCsAndUpdateChart();
          } else {
            cW.hideSegData();
          }
        }
      }
    },

    initializeChart: function() {
      console.log('initializeChart');
      // Create the chart within it's "holding" node
      // Global so users can hit it from the console
      cChartOne = new Chart("chartOne");

      // Add the only/default plot 
      cChartOne.addPlot("default", {
        //type: "Columns",
        type: "StackedColumns",
        markers: true,
        gap: 5
      });
      
      console.log(scenarios.map(item => item.label))

      scenarioLabels = [];

      for (s in scenarios) {
        scenarioLabels.push({value:parseInt(s)+1,text:scenarios[s].label})
      }
      console.log(scenarioLabels)
      //cChartOne.getAxis('x').labels =  scenarios.map(item => item.label);

      // Add axes
      cChartOne.addAxis("x", {
        font: "normal normal normal 8pt Verdana",
        //title: "Scenario",
        titleOrientation: "away",
        titleFont: "normal normal normal 10pt Verdana",
        labels: scenarioLabels,
        majorLabels: true,
        majorTickStep: 1,
        minorTickStep: 1,
        rotation: -90
      });

      cChartOne.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major", min: 0, max:2.0, majorTickStep: 0.5, minorLabels: false/*, title : "AADT"*/});
      
      //cChartOne.addSeries("V/C Ratios",aVCValues)

      cChartOne.addSeries("Series01", [], { stroke: { color: aCGrYl[0] }, fill: aCGrYl[0] });
      cChartOne.addSeries("Series02", [], { stroke: { color: aCGrYl[1] }, fill: aCGrYl[1] });
      cChartOne.addSeries("Series03", [], { stroke: { color: aCGrYl[2] }, fill: aCGrYl[2] });	
      cChartOne.addSeries("Series04", [], { stroke: { color: aCGrYl[3] }, fill: aCGrYl[3] });	
      cChartOne.addSeries("Series05", [], { stroke: { color: aCReds[0] }, fill: aCReds[0] });	
      cChartOne.addSeries("Series06", [], { stroke: { color: aCReds[1] }, fill: aCReds[1] });
      cChartOne.addSeries("Series07", [], { stroke: { color: aCReds[2] }, fill: aCReds[2] });
      cChartOne.addSeries("Series08", [], { stroke: { color: aCReds[3] }, fill: aCReds[3] });	
      cChartOne.addSeries("Series09", [], { stroke: { color: aCReds[4] }, fill: aCReds[4] });	
      cChartOne.addSeries("Series10", [], { stroke: { color: aCReds[5] }, fill: aCReds[5] });	
      cChartOne.addSeries("Series11", [], { stroke: { color: aCReds[6] }, fill: aCReds[6] });
      cChartOne.addSeries("Series12", [], { stroke: { color: aCReds[7] }, fill: aCReds[7] });
      cChartOne.addSeries("Series13", [], { stroke: { color: aCReds[8] }, fill: aCReds[8] });	
      cChartOne.addSeries("Series14", [], { stroke: { color: aCReds[9] }, fill: aCReds[9] });	
      cChartOne.addSeries("Series15", [], { stroke: { color: sCBlack   }, fill: sCBlack   });	
      //cChartOne.resize(330,215);
      var anim_b = new Tooltip(cChartOne, "default");

    },

    createSeasonsRadioButtons: function() {
      console.log('createSeasonsRadioButtons');
      
      var divSeasons = dom.byId("seasonsection");
      
      for (s in seasons) {

        if (seasons[s].value == sSeason || seasons[s].value == 'Jan') {
          bChecked = true;
        } else {
          bChecked = false;
        }
        
        //place radio button for collapsing months
        if (seasons[s].value == "Jan") {
 
          var rbSeason = new RadioButton({ name:"season", label:"Individual Month", id:"rb_IndividualMonth", value: "Individual Month"});
          rbSeason.startup();

          rbSeason.placeAt(divSeasons);
          //rbSeason.on("click", cW.updateVCGroup());
          
          var rbSeasonLabel = dojo.create('label', {
            innerHTML: "Individual Month",
            for: rbSeason.id
          }, divSeasons);

          dojo.place("<div id=\"monthcontainer\" style=\"display: none;\"></div>",divSeasons);
          var divMonths = dom.byId("monthcontainer");
          
          //Radio Buttons Change Event
          dom.byId("rb_IndividualMonth").onchange = function(isChecked) {
            if(isChecked) {
              divMonths.style.display = "block";
              bIndivMonthSelected = true;
              if (sMonthSelected == "") {
                sMonthSelected = 'Jan'
                sSeason = 'Jan'
              } else {
                sSeason = sMonthSelected;
              }
              cW.updateVCGroup();
            }
          }
        }

        if (seasons[s].SeasonType == "Season") {
          var divSeasonOrMonth = divSeasons;
          var rgname = "season";
          var indent = "";
          bSeason = true;
        } else if(seasons[s].SeasonType == "Month") {
          var divSeasonOrMonth = divMonths;
          var rgname = "month";
          dojo.place("<div style=\"display: inline-block;\">&nbsp;&nbsp;&nbsp;&nbsp;</div> ", divSeasonOrMonth);
          bSeason = false;
        }
        
        var rbSeason = new RadioButton({ name:rgname, label:seasons[s].label, id:"rb_" + seasons[s].value, value: seasons[s].value, checked: bChecked});
        rbSeason.startup();
        
        rbSeason.placeAt(divSeasonOrMonth);
        
        var rbSeasonLabel = dojo.create('label', {
          innerHTML: seasons[s].label,
          for: rbSeason.id
        }, divSeasonOrMonth);
        
        dojo.place("<br/>", divSeasonOrMonth);

        //Radio Buttons Change Event
        dom.byId("rb_" + seasons[s].value).onchange = function(isChecked) {
          if(isChecked) {
            sSeason = this.value
            if (seasons.find(o => o.value === sSeason).SeasonType == 'Season') {
              bIndivMonthSelected = false;
            } else if (seasons.find(o => o.value === sSeason).SeasonType == 'Month') {
              bIndivMonthSelected = true;
              sMonthSelected = sSeason;
            }
            cW.updateVCGroup();
          }
        }
      }
    },

    createDOWPeakRadioButtons: function() {
      console.log('createDOWPeakRadioButtons');
      
      var divDOWPeak = dom.byId("dowpeaksection");
            
      for (d in dowpeaks) {

        if (dowpeaks[d].value == sDOWPeak) {
          bChecked = true;
        } else {
          bChecked = false;
        }
        
        var rbDOWPeak = new RadioButton({ name:"dowpeak", label:dowpeaks[d].label, id:"rb_" + dowpeaks[d].value, value: dowpeaks[d].value, checked: bChecked});
        rbDOWPeak.startup();
        rbDOWPeak.placeAt(divDOWPeak);
        
        var lblDOWPeak = dojo.create('label', {
          innerHTML: dowpeaks[d].label,
          for: rbDOWPeak.id
        }, divDOWPeak);
        
        dojo.place("<br/>", divDOWPeak);

        //disable all non-weekday peaks
        if (dowpeaks[d].value.substring(0, 2) != 'Wk') {
          rbDOWPeak.set('disabled', true);
        }

        //Radio Buttons Change Event
        dom.byId("rb_" + dowpeaks[d].value).onchange = function(isChecked) {
          if(isChecked) {
            sDOWPeak = this.value
            cW.updateVCGroup();
          }
        }
      }
    },

    populateScenarios: function() {
      console.log(scenarios.length);
      vcLayers = [];
      for (s in scenarios) {
        console.log(scenarios[s].value);
        var layerInfosObject = LayerInfos.getInstanceSync();
        for (var j=0, jl=layerInfosObject._layerInfos.length; j<jl; j++) {
          var currentLayerInfo = layerInfosObject._layerInfos[j];
          _strLayerName = ('VC_' + scenarios[s].value).replace(/_/g, ' ');
          if (currentLayerInfo.title == _strLayerName) { //must mach layer title
            vcLayers.push(layerInfosObject._layerInfos[j].layerObject);
          }
        }
      }
    },

    getScenarioIdx: function() {
      return scenarios.findIndex(obj => obj.value==sScenario);
    },

    getScenarioIdxFromCode: function(sCode) {
      return scenarios.findIndex(obj => obj.value==sCode);
    },

    getCurrentVCLayer: function() {
      return vcLayers[cW.getScenarioIdx()];
    },

    updateScenario: function() {
      console.log('updateScenario')
      cW.updateVCDisplay();
      
      //Get VC Detailed Data
      dojo.xhrGet({
        url: "widgets/CongestionSidebar/data/segment_vcdata/" + sScenario + ".json",
        handleAs: "json",
        load: function(obj) {
          /* here, obj will already be a JS object deserialized from the JSON response */
          console.log(sScenario + ".json");
          segment_vcdata = obj;
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });

    },

    updateVCGroup: function() {
      var monthContainer = dom.byId("monthcontainer");
      if (monthContainer !== null) {
        if (bIndivMonthSelected) {
          monthContainer.style.display = "block";
        } else {
          monthContainer.style.display = "none";
        }
      }
      sVCGroup = sSeason + sDOWPeak + sInterval;
      console.log(sVCGroup)
      cW.updateVCDisplay();
    },

    updateVCDisplay: function() {
      console.log('updateVCDisplay')
      for (l in vcLayers) {
        if (l == cW.getScenarioIdx()){
          var vcClassRenderer = new UniqueValueRenderer({
            type: "unique-value",  // autocasts as new UniqueValueRenderer()
            valueExpression: "var v = $feature." + sVCGroup + ";" +
                             "var ft = $feature.FT;" +
                             "if      (v==0           ) { return 'class_0' ; }" +
                             "else if (v< 0.7  && ft< 10) { return 'class_a_01'; }" +
                             "else if (v< 0.8  && ft< 10) { return 'class_a_02'; }" +
                             "else if (v< 0.9  && ft< 10) { return 'class_a_03'; }" +
                             "else if (v< 1.0  && ft< 10) { return 'class_a_04'; }" +
                             "else if (v< 1.1  && ft< 10) { return 'class_a_r0'; }" +
                             "else if (v< 1.2  && ft< 10) { return 'class_a_r1'; }" +
                             "else if (v< 1.3  && ft< 10) { return 'class_a_r2'; }" +
                             "else if (v< 1.4  && ft< 10) { return 'class_a_r3'; }" +
                             "else if (v< 1.5  && ft< 10) { return 'class_a_r4'; }" +
                             "else if (v< 1.6  && ft< 10) { return 'class_a_r5'; }" +
                             "else if (v< 1.7  && ft< 10) { return 'class_a_r6'; }" +
                             "else if (v< 1.8  && ft< 10) { return 'class_a_r7'; }" +
                             "else if (v< 1.9  && ft< 10) { return 'class_a_r8'; }" +
                             "else if (v< 2.0  && ft< 10) { return 'class_a_r8'; }" +
                             "else if (v>=2.0  && ft< 10) { return 'class_a_b0'; }" +
                             "else if (v< 0.7  && ft>=10) { return 'class_f_01'; }" +
                             "else if (v< 0.8  && ft>=10) { return 'class_f_02'; }" +
                             "else if (v< 0.9  && ft>=10) { return 'class_f_03'; }" +
                             "else if (v< 1.0  && ft>=10) { return 'class_f_04'; }" +
                             "else if (v< 1.1  && ft>=10) { return 'class_f_r0'; }" +
                             "else if (v< 1.2  && ft>=10) { return 'class_f_r1'; }" +
                             "else if (v< 1.3  && ft>=10) { return 'class_f_r2'; }" +
                             "else if (v< 1.4  && ft>=10) { return 'class_f_r3'; }" +
                             "else if (v< 1.5  && ft>=10) { return 'class_f_r4'; }" +
                             "else if (v< 1.6  && ft>=10) { return 'class_f_r5'; }" +
                             "else if (v< 1.7  && ft>=10) { return 'class_f_r6'; }" +
                             "else if (v< 1.8  && ft>=10) { return 'class_f_r7'; }" +
                             "else if (v< 1.9  && ft>=10) { return 'class_f_r8'; }" +
                             "else if (v< 2.0  && ft>=10) { return 'class_f_r9'; }" +
                             "else if (v>=2.0  && ft>=10) { return 'class_f_b0'; }",
            uniqueValueInfos: [{value:"class_0"   , label:"No Data"      , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(sCVCGrad0), 0.5)},
                               {value:"class_f_01", label:"Less than 0.7", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCGrYl[0]), 8.0)},
                               {value:"class_f_02", label:"0.7 to 0.8"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCGrYl[1]), 8.0)},
                               {value:"class_f_03", label:"0.8 to 0.9"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCGrYl[2]), 8.0)},
                               {value:"class_f_04", label:"0.9 to 1.0"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCGrYl[3]), 8.0)},
                               {value:"class_f_r0", label:"1.0 to 1.1"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[0]), 9.0)},
                               {value:"class_f_r1", label:"1.1 to 1.2"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[1]), 9.0)},
                               {value:"class_f_r2", label:"1.2 to 1.3"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[2]), 9.0)},
                               {value:"class_f_r3", label:"1.3 to 1.4"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[3]), 9.0)},
                               {value:"class_f_r4", label:"1.4 to 1.5"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[4]), 9.0)},
                               {value:"class_f_r5", label:"1.5 to 1.6"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[5]),10.0)},
                               {value:"class_f_r6", label:"1.6 to 1.7"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[6]),10.0)},
                               {value:"class_f_r7", label:"1.7 to 1.8"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[7]),10.0)},
                               {value:"class_f_r8", label:"1.8 to 1.9"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[8]),10.0)},
                               {value:"class_f_r9", label:"1.9 to 2.0"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[9]),10.0)},
                               {value:"class_f_b0", label:"More than 2.0", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(sCBlack)  ,10.0)},                              {value:"class_a_01", label:"Less than 0.7", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCGrYl[0]), 2.0)},
                               {value:"class_a_01", label:"Less than 0.7", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCGrYl[0]), 1.0)},
                               {value:"class_a_02", label:"0.7 to 0.8"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCGrYl[1]), 1.0)},
                               {value:"class_a_03", label:"0.8 to 0.9"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCGrYl[2]), 1.0)},
                               {value:"class_a_04", label:"0.9 to 1.0"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCGrYl[3]), 1.0)},
                               {value:"class_a_r0", label:"1.0 to 1.1"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[0]), 2.0)},
                               {value:"class_a_r1", label:"1.1 to 1.2"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[1]), 2.0)},
                               {value:"class_a_r2", label:"1.2 to 1.3"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[2]), 2.0)},
                               {value:"class_a_r3", label:"1.3 to 1.4"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[3]), 2.0)},
                               {value:"class_a_r4", label:"1.4 to 1.5"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[4]), 2.0)},
                               {value:"class_a_r5", label:"1.5 to 1.6"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[5]), 3.0)},
                               {value:"class_a_r6", label:"1.6 to 1.7"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[6]), 3.0)},
                               {value:"class_a_r7", label:"1.7 to 1.8"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[7]), 3.0)},
                               {value:"class_a_r8", label:"1.8 to 1.9"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[8]), 3.0)},
                               {value:"class_a_r9", label:"1.9 to 2.0"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCReds[9]), 3.0)},
                               {value:"class_a_b0", label:"More than 2.0", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(sCBlack)  , 3.0)}]
                               });
          vcLayers[l].setRenderer(vcClassRenderer);
          vcLayers[l].show()

        } else {
          vcLayers[l].hide()
        }
      }
      if (typeof seasons !== 'undefined' && typeof dowpeaks !== 'undefined') {
        //season removed from legend
        //dom.byId("LegendNameCongestion").innerHTML = scenarios.find(o => o.value === sScenario).label + ' - ' + seasons.find(o => o.value === sSeason).label + ' ' + dowpeaks.find(o => o.value === sDOWPeak).label + '<br/>' + sIntervalLabel
        dom.byId("LegendNameCongestion").innerHTML = scenarios.find(o => o.value === sScenario).label + '<br/>' + dowpeaks.find(o => o.value === sDOWPeak).label + ' ' + sIntervalLabel
        dom.byId("NameCalculationDetails").innerHTML = scenarios.find(o => o.value === sScenario).label + '<br/>' + dowpeaks.find(o => o.value === sDOWPeak).label + ' ' + sIntervalLabel
      } else {
        dom.byId("LegendNameCongestion").innerHTML = ""
        dom.byId("NameCalculationDetails").innerHTML = ""
      }
      if (g_sSegID != '') {
        cW.getVCsAndUpdateChart();
      } else {
        cW.hideSegData();
      }
    },

    hideSegData: function() {
      dom.byId("SegmentDetails").style.display = sBlockHide;
    },

    showSegData: function() {
      dom.byId("SegmentDetails").style.display = sBlockShow;
    },

    updateChart: function() {
      console.log('updateChart')

      if (cChartOne == undefined) {
        cW.initializeChart();
      }

      dom.byId("chartName").innerHTML = "V/C Ratios by Scenario<br/>" + seasons.find(o => o.value === sSeason).label + ' ' + dowpeaks.find(o => o.value === sDOWPeak).label + " - " + sIntervalLabel+ "<br/><small>Segment: " + g_sSegID + "</small>"

      aVCValuesByColor["s01"] = [];
      aVCValuesByColor["s02"] = [];
      aVCValuesByColor["s03"] = [];
      aVCValuesByColor["s04"] = [];
      aVCValuesByColor["s05"] = [];
      aVCValuesByColor["s06"] = [];
      aVCValuesByColor["s07"] = [];
      aVCValuesByColor["s08"] = [];
      aVCValuesByColor["s09"] = [];
      aVCValuesByColor["s10"] = [];
      aVCValuesByColor["s11"] = [];
      aVCValuesByColor["s12"] = [];
      aVCValuesByColor["s13"] = [];
      aVCValuesByColor["s14"] = [];
      aVCValuesByColor["s15"] = [];

      //get location of value in array of colors
      function getIndexToIns(arr, num) {
        let index = arr.sort((a, b) => a - b).findIndex((currentNum) => num <= currentNum)
        return index === -1 ? arr.length : index
      }

      for(var i=0; i<aVCValues.length;i++){
        var _num = getIndexToIns(aColorRanges, aVCValues[i]).toString();
        while (_num.length < 2) _num = "0" + _num;
        sRange = "s" + _num
        aVCValuesByColor["s01"].push(0);
        aVCValuesByColor["s02"].push(0);
        aVCValuesByColor["s03"].push(0);
        aVCValuesByColor["s04"].push(0);
        aVCValuesByColor["s05"].push(0);
        aVCValuesByColor["s06"].push(0);
        aVCValuesByColor["s07"].push(0);
        aVCValuesByColor["s08"].push(0);
        aVCValuesByColor["s09"].push(0);
        aVCValuesByColor["s10"].push(0);
        aVCValuesByColor["s11"].push(0);
        aVCValuesByColor["s12"].push(0);
        aVCValuesByColor["s13"].push(0);
        aVCValuesByColor["s14"].push(0);
        aVCValuesByColor["s15"].push(0);
        aVCValuesByColor[sRange][i] = aVCValues[i]
      }

      //Update chart series with data from selected date
      //cChartOne.updateSeries("V/C Ratios", aVCValues);
      cChartOne.updateSeries("Series01", aVCValuesByColor["s01"]);
      cChartOne.updateSeries("Series02", aVCValuesByColor["s02"]);
      cChartOne.updateSeries("Series03", aVCValuesByColor["s03"]);
      cChartOne.updateSeries("Series04", aVCValuesByColor["s04"]);
      cChartOne.updateSeries("Series05", aVCValuesByColor["s05"]);
      cChartOne.updateSeries("Series06", aVCValuesByColor["s06"]);
      cChartOne.updateSeries("Series07", aVCValuesByColor["s07"]);
      cChartOne.updateSeries("Series08", aVCValuesByColor["s08"]);
      cChartOne.updateSeries("Series09", aVCValuesByColor["s09"]);
      cChartOne.updateSeries("Series10", aVCValuesByColor["s10"]);
      cChartOne.updateSeries("Series11", aVCValuesByColor["s11"]);
      cChartOne.updateSeries("Series12", aVCValuesByColor["s12"]);
      cChartOne.updateSeries("Series13", aVCValuesByColor["s13"]);
      cChartOne.updateSeries("Series14", aVCValuesByColor["s14"]);
      cChartOne.updateSeries("Series15", aVCValuesByColor["s15"]);
      //cChartOne.resize(330,215);
      cChartOne.render();
    },

    getVCsAndUpdateChart: function() {
      console.log('getVCsAndUpdateChart');

      dom.byId("CapacityDetails").innerHTML = "";
      dom.byId("ForecastDetails").innerHTML = "";
      
      iCount = 0;

      //loop through all layers to get v/c's to chart
      for (l in vcLayers) {

        var query = new Query();
        query.returnGeometry = false;
        query.where = "SEGID='" + g_sSegID + "'";
        query.outFields = ['Scenario',sVCGroup];
        lyrCongestion = cW.getCurrentVCLayer();

        var queryTaskSeg = new QueryTask(vcLayers[l].url);
        
        aVCValues = new Array(scenarios.length).fill(0);

        //execute query
        queryTaskSeg.execute(query,showResultsGetVC);
        
        //Intersection search results
        function showResultsGetVC(results) {
          console.log('showResultsGetVC');

          iCount++;
          
          var resultCount = results.features.length;
          //should only be one segment
          if (resultCount>=1) {
            var featureAttributes = results.features[0].attributes;
            _sLoc = cW.getScenarioIdxFromCode(featureAttributes['Scenario']);
            aVCValues[_sLoc] = featureAttributes[sVCGroup];
          }
          if (iCount == vcLayers.length) {
            console.log(aVCValues);
            cW.updateChart();
            cW.updateSegmentDetails();
          }
        }
      }
    },

    updateSegmentDetails: function() {
      console.log('updateSegmentDetails');
      
      dom.byId("CapacityDetails").innerHTML = "<br/><br/><b>Segment Capacity Characteristics:</b><br/>" + segmentdetails.find(o => o.SEGID === g_sSegID).SegDetail_HTML;
      dom.byId("ForecastDetails").innerHTML = "<hr/><p class=\"thick thicker\"><b>Segment " + g_sSegID + "</b></p><br/><b>Segment Volume Forecast:</b><br/><br/>" + forecastdetails.find(o => o.SEGID === g_sSegID).Forecast_HTML;

      aFG     = ['Freeway','Arterial','Managed','CD Road'];
      aFGCode = ['Fwy'    ,'Art'     ,'Mng'    ,'_CD'    ];
      aDir    = ['1','2'];
      aCodes  = ['VCG','FG','FGF','SG','SF','DOW','PF','HF','D','DF','MD','HV','TF','PHF','LN','AT','FT','CP','PrdF','PkF','15F','PrdVC','PkVC','15VC']

      //clear all detail divs using all possible combinations of FG, Code, Dir
      for (a in aFGCode) {
        for (b in aCodes) {
          for (c in aDir) {
            var ctl = dom.byId(aFGCode[a] + "_" + aCodes[b] + aDir[c])
            if (ctl) {
              ctl.innerHTML = "";
              //default is to hide Functional Group Factor divs unless the FGF is < 1.0, in later code
              if (aCodes[b] == "FGF") {
                dom.byId(aFGCode[a] + "_FGFDiv").style.display = sTbodyHide;
              }
            }
          }
        }
      }
      //get vcdata for a given segment
      let segdata  = segment_vcdata.find(segment_vcdata => segment_vcdata.S == g_sSegID);
      
      //segment and forecast
      dom.byId("SegmentID").innerHTML = segdata.S;
      dom.byId("Forecast").innerHTML = segdata.Fa;
      
      //populate detal divs
      aFG.forEach(function(sFG) {
        dom.byId("Detail"+aFGCode[aFG.indexOf(sFG)]).style.display = sBlockHide;
        aDir.forEach(function(sDir){
          let segvcdata = segdata.VCData;
          //get data for given combination of FG, Code, Dir
          let segvcfgddata = segvcdata.find(segvcdata => segvcdata.VCG == sVCGroup.substring(0,7) && segvcdata.FG == sFG && segvcdata.D == "D" + sDir);
          for (x in segvcfgddata) {
            dom.byId("Detail"+aFGCode[aFG.indexOf(sFG)]).style.display = sBlockShow;
            var ctl = dom.byId(aFGCode[aFG.indexOf(sFG)] + "_" + x + sDir)
            if (ctl) {
              ctl.innerHTML = segvcfgddata[x];
              if (x == "FGF") {
                if (segvcfgddata[x] != '1.000') {
                  dom.byId(aFGCode[aFG.indexOf(sFG)] + "_FGFDiv").style.display = sTbodyShow;
                }
              }
            }
          }
        });
      });
    },
    
    toggleVCDetals: function() {
      var segDetails = dom.byId("VCDetail");
      
      if (segDetails.style.display == sBlockHide) {
        segDetails.style.display = sTbodyShow;
        btnDetails.innerHTML = sDetailsButtonExpanded;
      } else {
        segDetails.style.display = sTbodyHide;
        btnDetails.innerHTML = sDetailsButtonCollapsed;
      }
    },

    onOpen: function() {
      console.log('onOpen');
    },

    onClose: function() {
      console.log('onClose');
    },

    onMinimize: function() {
      console.log('onMinimize');
    },

    onMaximize: function() {
      console.log('onMaximize');
    },

    onSignIn: function(credential) {
      /* jshint unused:false*/
      console.log('onSignIn');
    },

    onSignOut: function() {
      console.log('onSignOut');
    },

    //added from Demo widget Setting.js
    setConfig: function(config) {
    var test = "";
    },

    getConfigFrom: function() {
      //WAB will get config object through this method
      return {
        //districtfrom: this.textNode.value
      };
    },
    
  });
});