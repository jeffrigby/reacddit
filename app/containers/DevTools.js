import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
window.ReactPerf = require('react-addons-perf');

export default createDevTools(
	<DockMonitor toggleVisibilityKey="ctrl-h"
	           changePositionKey="ctrl-w">
		<LogMonitor />
	</DockMonitor>
);
