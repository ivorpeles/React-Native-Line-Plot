'use strict';

import React, { Component, PropTypes } from 'react';
import {
    Text,
    View,
    Dimensions,
    StyleSheet,
} from 'react-native';
import Svg, { 
    Text as SVGText,
    Polyline,
    Polygon,
    Path
} from 'react-native-svg';
var _ = require('lodash');

const Graph = React.createClass({
    propTypes: {
        data: PropTypes.array.isRequired,
        graphColorPrimary: PropTypes.string.isRequired,
        graphColorSecondary: PropTypes.string.isRequired,
        graphWidthPrimary: PropTypes.string,
        graphWidthSecondary: PropTypes.string,
        graphHeight: PropTypes.number,
        graphWidth: PropTypes.number,
        paddingBottom: PropTypes.number,
        xAxisDensity: PropTypes.number,
        yAxisDensity: PropTypes.number,
        xUnit: PropTypes.string,
        yUnit: PropTypes.string,
    },
    getInitialState () {
        const dimensions = Dimensions.get('window');
        if (this.props.graphHeight && this.props.graphWidth) {
            return {
                height: this.props.graphHeight,
                width: this.props.graphWidth
            }
        } else {
            return {
                height: (dimensions.height * 0.8),
                width: (dimensions.width * 0.8) 
            }
        }
    },
    getProcessedData () {
        const h = this.state.height;
        const w = this.state.width;
        var data = this.props.data.sort({function (x,y) {
            return ((x[0] < y[0]) ? -1 : ((x[0] > y[0]) ? 1 : 0));
        }});
        var y_arr = data.map((obj) => { return obj[1] });
        var x_arr = data.map((obj) => { return obj[0] });
        const x_min = Math.min(...x_arr);
        const y_min = Math.min(...y_arr);
        const x_scale = Math.max(...x_arr) - x_min;
        const y_scale = Math.max(...y_arr) - y_min;
        data = data.map((obj, index, array) => {
            var x = ((obj[0] - x_min) * w / (x_scale));
            var y = h - ((obj[1] - y_min) * h / (y_scale)) + 8;
            return [x, y];
        });
        const seg = data.slice(-2);
        var u = seg[1][0];
        var v = seg[1][1];
        var d = Math.sqrt(Math.pow(seg[0][0] - u, 2) 
                + Math.pow(seg[0][1] - v, 2));
        data.pop();
        data.push([u,v].map((obj) => { return obj * (d - 8) / d}));
        return data;
    }, 
    stringifyData: function (data) {
        var outputStr = "";
        const l = data.length;
        for (var i = 0; i < l; i++) {
            outputStr += String(data[i][0]) + "," 
                + String(data[i][1]) + " ";
        }
        return outputStr;
    },
    getLinePlotArrow: function (data) {
        /* 
         * Slice the array returned by getProcessedData to obtain the two
         * coordinate pairs that define the last line segment of our line
         * plot. Call these points (x,y) and (u,v).
         * */
        var arr = data.slice(-2); 
        // (x,y) is the left-most point in the line segment.
        const x = arr[0][0];
        const y = arr[0][1];
        // (u,v) is the right-most point.
        const u = arr[1][0];
        const v = arr[1][1];
        // The slope of the line segment, and the perpendicular slope.
        const slope = (v - y) / (u - x);
        const perp = -1 / slope ;
        // The euclidean distance between (x,y) and (u,v)
        const d = Math.sqrt(Math.pow(u - x, 2) + Math.pow(v - y, 2));
        // w and e are the width and extension factors respectively for the
        // graph arrow
        const w = 5 / Math.sqrt(1 + Math.pow(perp, 2));
        const e = 8 / Math.sqrt(1 + Math.pow(slope, 2));
        const tip = String(u + e) + "," + String(v + ((slope * e))) + " ";
        const s1 = String(u + w) + "," + String(v + (w * perp)) + " ";
        const s2 = String(u - w) + "," + String(v - (w * perp)) + " ";
        return tip + s1 + s2;
    },
    getAxes: function () {
        return "10,10 10," + String(this.state.height) 
            + " " + String(this.state.width)+ "," + String(this.state.height);
    },
    getAxisArrowEast: function () {
        return String(this.state.width + 8) 
            + "," + String(this.state.height)
            + " " + String(this.state.width)
            + "," + String(this.state.height - 4)
            + " " + String(this.state.width)
            + "," + String(this.state.height + 4);
    },
    getXTicks: function () {
        const ticks = this.props.xAxisDensity || 6;
        const w = this.state.width;
        const h = String(this.state.height);
        const ha = String(this.state.height - 5);
        const spacing = w / ticks ; 
        var outputStr = "";
        for (var i = 1; i < ticks; i++) {
            outputStr += "M" + String(i * spacing) + " " + h + " "
                + "L" + String(i * spacing) + " " + ha + " ";
        }
        return outputStr;
    },
    getYTicks: function () {
        const ticks = this.props.yAxisDensity || 9;
        const h = this.state.height;
        const spacing = h / ( ticks ); 
        var outputStr = "";
        for (var i = 1; i < ticks; i++) {
            outputStr += "M10 " + String(i * spacing) 
                + " L15 " + String(i * spacing) + " ";    
        }
        return outputStr;
    },
    render: function () {
        var that = this;
        const dateMode = (this.props.xUnit == "date") ? 1 : 0;
        var rData = this.props.data;
        var data = this.getProcessedData();

        const yDensity = this.props.yAxisDensity || 9;
        const yVisualSpacing = this.state.height / yDensity;
        var yArr = rData.map((obj) => { return obj[1] });
        const yMax = Math.max(...yArr);
        const yMin = Math.min(...yArr);
        const yRange = yMax - yMin;
        const yNumericalSpacing = yRange / yDensity;

        const xDensity = this.props.xAxisDensity || 6;
        const xVisualSpacing = (this.state.width) / (xDensity);
        var xArr = rData.map((obj) => {return obj[0]});
        const xMin = Math.min(...xArr);
        const xRange = Math.max(...xArr) - xMin;
        const xNumericalSpacing = xRange / xDensity;
        xArr = _.range(xDensity - 1).map((obj) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var time = Math.round(xMin + (xNumericalSpacing * obj));
            var date = new Date(time);
            var dateStr = months[date.getUTCMonth()] + ' ' + date.getUTCDate();
            var numStr = String(time);
            return [numStr, dateStr];
        });

        return(
            <View style={styles.graph}>
                <Svg height={this.state.height + 20} width={this.state.width + 20}>
                    <SVGText
                        fill={this.props.graphColorSecondary}
                        fontSize="8"
                        x="18"
                        y="0">
                        {this.props.yUnit}
                    </SVGText>
                    <SVGText
                        fill={this.props.graphColorSecondary}
                        fontSize="8"
                        x={this.state.width}
                        y={this.state.height - 25}>
                        {this.props.xUnit}
                    </SVGText>
                    <Polyline
                        points={this.stringifyData(data)}
                        fill="none"
                        stroke={this.props.graphColorPrimary}
                        strokeWidth={this.props.graphWidthPrimary || "4"}
                    />
                    <Polyline
                        points={this.getAxes()}
                        fill="none"
                        stroke={this.props.graphColorSecondary}
                        strokeWidth={this.props.graphWidthSecondary || "4"}
                    />
                    <Polygon
                        points="10,2 6,10 14,10"
                        fill={this.props.graphColorSecondary}
                        stroke={this.props.graphColorSecondary}
                        strokeWidth="1"
                    />
                    <Polygon
                        points={this.getAxisArrowEast()}
                        fill={this.props.graphColorSecondary}
                        stroke={this.props.graphColorSecondary}
                        strokeWidth="1"
                    />
                    <Polygon
                        points={this.getLinePlotArrow(data)}
                        fill={this.props.graphColorPrimary}
                        stroke={this.props.graphColorPrimary}
                        strokeWidth="1"
                    />
                    <Path
                        d={this.getYTicks()}
                        fill="none"
                        stroke={this.props.graphColorSecondary}
                    />
                    <Path
                        d={this.getXTicks()}
                        fill="none"
                        stroke={this.props.graphColorSecondary}
                    />
                    {_.range(yDensity - 1).map(function(object, i){
                        return  <SVGText 
                                fill={that.props.graphColorSecondary}
                                x="18"
                                y={that.state.height - (i + 1) * yVisualSpacing - 8}>
                                {String(Math.round(yMin + 
                                            (i + 1) * yNumericalSpacing))}
                            </SVGText>;
                    })}
                    {xArr.map(function(object, i){
                        return  <SVGText 
                                textAnchor="middle"
                                fill={that.props.graphColorSecondary}
                                x={((i + 1) * xVisualSpacing)}
                                y={ that.state.height - 20 }>
                                {object[dateMode]}
                            </SVGText>;
                    })}
                </Svg>
            </View>
        );
    }
});

const styles = StyleSheet.create({
    graph: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 0,
    }
});

module.exports = Graph;
