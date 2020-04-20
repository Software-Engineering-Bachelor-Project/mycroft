import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from '../state';

// Import Core Components
import Player from './player/player';
import Map from './map/map';
import Menu from './menu/menu';
import Viewport from './viewport/viewport';
import Timeline from './timeline/timeline';
import Browser from './browser/browser';

// TODO: Remove
import Evoker from './evoker';

/*
 * This is the main component of Mycroft.
 */

/* -- ROOT COMPONENT -- */
class App extends Component {
    render() {
		return (
			// TODO: implement product
			<div>
				<Map />
				<Player />
				<Menu />
				<Viewport />
				<Browser/> 
				<Timeline />
                <Evoker />
			</div>
		);
    }
}

// Export App
export default App;

// Put App component in template
const container = document.getElementById('app');
// Note that the App is wrapped with react-redux's Provider
render(<Provider store={store}><App /></Provider>, container);
