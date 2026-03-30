import { useLayoutEffect, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { list_month } from '../../utils/datetime/month';

function SecondChart({ chartData }) {

  useLayoutEffect(() => {
    let root = am5.Root.new("chartdiv", {
    });

    root.container.children.push(am5xy.XYChart.new(root, {
      maxTooltipDistance: 0
    }))

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        layout: root.verticalLayout,
        // paddingTop:0,
        // marginTop: 0,
        // marginBottom: 0,
        // paddingBottom: 0,
        paddingLeft: 0
      })
    );

    // chart.topAxesContainer.children.push(am5.Label.new(root, {
    //   text: "Sales breakdown by regin",
    //   fontSize: 20,
    //   fontWeight: "400",
    //   x: am5.p50, centerX: am5.p50
    // }))

    // Define data

    let data = []



    list_month.forEach((m, index) => {
      data.push({ category: m })
    })

    chartData?.forEach((ev) => {
      let n = ev.event
      ev.data.forEach((d, index) => {
        data[index][ev.event] = d
      })
    })


    // Create Y-axis
    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    let xRenderer = am5xy.AxisRendererX.new(root, {minGridDistance:0})

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: xRenderer,
        categoryField: "category",
        maxDeviation: 0.3,
      })
    );

    xRenderer.labels.template.setAll({oversizedBehavior:'wrap', textAlign: 'start'})


    xAxis.data.setAll(data);

    let color = ['rgba(70,128,255,1)','#FC6180', '#FFB64D']


    chartData?.forEach((e, index) => {
      let series2 = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name: e.event,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: e.event,
          connect: false,
          categoryXField: "category",
          tooltip: am5.Tooltip.new(root, {
            labelText: "[bold]{name}[/]\n{categoryX}: {valueY}"
          }),
          legendLabelText: "{name}: {categoryX}: {valueY}",
          // stacked: true
          // legendRangeLabelText: "{name} : {name}",
          tension: 0.5,
          locationX:0,
          fill: am5.color(color[index]),
          stroke: am5.color(color[index]),
        })
      );
      series2.strokes.template.setAll({
        strokeWidth: 3,
        strokeDasharray: [10, 5],
      })

      series2.bullets.push(function (root) {
        return am5.Bullet.new(root, {
          locationX: 0,
          sprite: am5.Circle.new(root, {
            radius: 4,
            fill: color[index],
            position: 'relative',
          
          })
        })
      })

      series2.fills.template.setAll({
        fillOpacity: 0.1,
        visible: index===0,
      })

      // series2.columns.template.setAll({
      //   // fill: color[index],

      //     fillOpacity: 0.1,
      //     strokeWidth: 2,
      //     stroke: color[index],
      //     // cornerRadiusTL: 5,
      //     // cornerRadiusTR: 5,
      //     // width: am5.percent(30),
      //   })

      series2.data.setAll(data);

      series2.appear(500, 200)

    })


    // Add legend
    let legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      layout: am5.GridLayout.new(root, { maxColumns: 3, fixedWidthGrid: true }),
    }));
    legend.data.setAll(chart.series.values);



    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    let cursor = chart.get('cursor')
    cursor.lineX.setAll({
      // visible: false
    })

    cursor.lineY.setAll({
      // visible: false
    })

    return () => {
      root.dispose();
    };
  }, [chartData]);

  return (
    <div id="chartdiv" style={{ width: "100%", height: "400px" }}></div>
  );
}
export default SecondChart;