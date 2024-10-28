import {createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import colors from "../constant/colors";
import Records from "../screens/Records";

const TopBarNavigator = () => {

    const Toptab = createMaterialTopTabNavigator();
    const activeColor = {
        awaiting: colors.orange[500],
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
        <Toptab.Screen name="awaiting" children={() => <Records status={"awaiting response"}/>} />
        <Toptab.Screen name="on-going" children={() => <Records status={"on-going"}/>} />
        <Toptab.Screen name="resolved" children={() => <Records status={"resolved"}/>} />
        <Toptab.Screen name="expired" children={() => <Records status={"expired"}/>} />
    </Toptab.Navigator>
  )
}

export default TopBarNavigator
