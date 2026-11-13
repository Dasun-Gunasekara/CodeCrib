import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddEditSnippetScreen from '../screens/AddEditSnippetScreen';
import SnippetDetailsScreen from '../screens/SnippetDetailsScreen';
import SnippetListScreen from '../screens/SnippetListScreen';

const Stack = createNativeStackNavigator();

export default function SnippetsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SnippetList" component={SnippetListScreen} />
      <Stack.Screen name="SnippetDetails" component={SnippetDetailsScreen} />
      <Stack.Screen name="AddEditSnippet" component={AddEditSnippetScreen} />
    </Stack.Navigator>
  );
}
