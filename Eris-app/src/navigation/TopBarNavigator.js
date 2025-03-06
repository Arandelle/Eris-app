import {createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import colors from "../constant/colors";
import Records from "../screens/Records";

const TopBarNavigator = () => {

    const Toptab = createMaterialTopTabNavigator();
    const activeColor = {
        pending: colors.orange[500],
        "on-going" : colors.blue[500],
        resolved : colors.green[500]
    }

  return (
    <Toptab.Navigator 
        screenOptions={({route}) => ({
           tabBarActiveTintColor : activeColor[route.name],
           tabBarInactiveTintColor: colors.gray[400],
           tabBarIndicatorStyle : {backgroundColor: activeColor[route.name]},
           tabBarLabelStyle : {fontWeight: "bold"},
        })}
    >
        <Toptab.Screen name="pending" component={Records} initialParams={{status: "pending"}} />
        <Toptab.Screen name="on-going" component={Records} initialParams={{status: "on-going"}} />
        <Toptab.Screen name="resolved"  component={Records} initialParams={{status: "resolved"}}/>
    </Toptab.Navigator>
  )
}

export default TopBarNavigator
