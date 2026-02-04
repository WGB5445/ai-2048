/**
 * @format
 */

import ReactTestRenderer from 'react-test-renderer';
import App from '../src/App';

test('renders without crashing', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  expect(renderer?.root).toBeDefined();
});

test('renders app structure with root content', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  const root = renderer?.root;
  const treeJson = renderer?.toJSON();
  expect(root).toBeDefined();
  expect(treeJson).not.toBeNull();
  expect(typeof treeJson).toBe('object');
  expect(treeJson && 'type' in treeJson && treeJson.type).toBeDefined();
});
