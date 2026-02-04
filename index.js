/**
 * @format
 * Must be first so crypto.getRandomValues is available for tweetnacl (Petra score upload).
 */
import 'react-native-get-random-values';
import { AppRegistry } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { name as appName } from './app.json';
import App from './src/App';

AppRegistry.registerComponent(appName, () => () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <App />
  </GestureHandlerRootView>
));
