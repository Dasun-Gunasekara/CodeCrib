import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import FavoritesScreen from '../screens/FavoritesScreen';
import HomeScreen from '../screens/HomeScreen';
import QuizScreen from '../screens/QuizScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SnippetsStack from './SnippetsStack';

const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: 'home',
  Snippets: 'code-slash',
  Favorites: 'heart',
  Quiz: 'help-circle',
  Settings: 'settings',
};

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={`${tabIcons[route.name]}${focused ? '' : '-outline'}`}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarAccessibilityLabel: 'Home tab, learning dashboard' }}
      />
      <Tab.Screen
        name="Snippets"
        component={SnippetsStack}
        options={{ tabBarLabel: 'Library', tabBarAccessibilityLabel: 'Snippet library tab' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarLabel: 'Saved', tabBarAccessibilityLabel: 'Saved snippets tab' }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
        options={{ tabBarLabel: 'Quiz', tabBarAccessibilityLabel: 'Quiz tab' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings', tabBarAccessibilityLabel: 'Settings tab' }}
      />
    </Tab.Navigator>
  );
}
