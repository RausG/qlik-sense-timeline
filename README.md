# [Qlik Sense](http://global.qlik.com/uk/explore/products/sense) Timeline Chart

- GitHub URL: https://github.com/SirGarnet/qlik-sense-timeline

## Screenshot

![image](https://raw.githubusercontent.com/SirGarnet/qlik-sense-timeline/master/googtimeline/googtimeline.png)

## Overview

The Qlik Sense Timeline Chart is a chart extension for the use in [Qlik Sense](http://global.qlik.com/uk/explore/products/sense) Desktop or Server. It is versatile chart that allows you to depict how multiple artifacts, be they projects or resources, are active/used over time in relation to each other.

Examples:

- You are managing a software project and want to illustrate who is doing what and when
- You are organising a conference and need to schedule meeting rooms
- You are running marketing campaigns and would like a scheduling overview

The Qlik Sense Timeline Chart leverages the [Google Chart API](https://developers.google.com/chart/interactive/docs/gallery/timeline).

## Usage

Dimensions:
- Dimension 1 _(required)_: Main dimension and row label
- Dimension 2 _(optional)_: Bar label

Measures:
- Measure 1 _(required)_: start date, format YYYY-MM-DD (ISO)
- Measure 2 _(required)_: end date, format YYYY-MM-DD (ISO)
- Measure 3 _(optional)_: Tooltip in plain text or HTML

## Custom settings:

I've added some extensions after the fork of https://github.com/kai/qlik-sense-timeline/

### Labels

- Show/hide row labels (Dim 1)
- Show/hide bar labels (Dim 2) - _Shown if 2nd dimension exists_

### Tooltip

- Enable/disable tooltip
- Parse tooltip as HTML / plain text - _Shown if 3rd meassure exists_

### Grouping

- Group bars by 1st dimension

### Color

- Background color with Qlik-Color-Picker
- Set single color for all bars with Qlik-Color-Picker
- Color by row label - _Shown if SingleColor is set to off_
- Select between Google and Qlik palette - _Shown if SingleColor is set to off_

