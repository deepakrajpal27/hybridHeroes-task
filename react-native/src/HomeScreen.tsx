import React, { useEffect } from "react";
import { Appbar, FAB } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { View, FlatList, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { RootState } from "./store";
import { selectors, actions } from "./store/inventory";
import { StackScreenProps } from "@react-navigation/stack";

import ProductItem from "./components/ProductItem";

export default (props: StackScreenProps<{}>) => {
  const fetching = useSelector((state: RootState) => state.inventory.fetching);
  const inventory = useSelector(selectors.selectInventory);
  const offset = useSelector(selectors.inventoryOffset);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      dispatch(actions.fetchInventory());
    });
    return unsubscribe;
  }, [props.navigation]);

  const onScrollEnding = () => dispatch(actions.fetchMoreInventory(offset));

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Inventory" />
      </Appbar.Header>

      <FlatList
        data={inventory}
        extraData={true}
        refreshing={fetching}
        onEndReachedThreshold={0.5}
        onEndReached={onScrollEnding}
        keyExtractor={(_, idx) => idx.toString()}
        onRefresh={() => dispatch(actions.fetchInventory())}
        renderItem={({ item }) => <ProductItem {...{ ...item }} />}
      />

      <SafeAreaView style={styles.fab}>
        <FAB
          icon={() => (
            <MaterialCommunityIcons name="barcode" size={24} color="#0B5549" />
          )}
          label="Scan Product"
          onPress={() => props.navigation.navigate("Camera")}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    flex: 1,
    bottom: 16,
    width: "100%",
    alignItems: "center",
    position: "absolute"
  }
});
