###React Native Line Plot

####Installation

The only dependency for this package is React Native SVG. Installation
instructions for SVG can be found at
https://github.com/magicismight/react-native-svg/blob/master/README.md
or below:

First ensure that rnpm is installed:
```
npm i rnpm -g
```
Then install React Native SVG:
```
npm install react-native-svg --save
```
Link it to rnpm:
```
rnpm link react-native-svg
```

After installing SVG, just install the library from npm:
```
npm i react-native-line-plot
```

####Basic Usage

Import the library in your index.ios.js file:
```
import Graph from 'react-native-line-plot';
```

Then, stick the Graph component in a render function:
```
var GraphTestProject = React.createClass({
    render () {
        <View style={styles.container}>
            <Graph
                data={[]}
                graphColorPrimary='#000000'
                graphColorSecondary='#FF0000'
                xUnit='foo'
                yUnit='bar'
            />
        </View>    
    }
});
```
