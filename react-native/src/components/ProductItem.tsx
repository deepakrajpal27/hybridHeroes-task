import * as React from "react";
import dayjs from "dayjs";
import { Card, Chip } from "react-native-paper";
import { Image, View, StyleSheet } from "react-native";

import { Inventory } from "../store/inventory";

const PlaceHolderImage =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png";

const ProductItem: React.FC<Inventory> = ({ fields }) => {
  const formatDate = (date: Date | string) => dayjs(date).format("DD.MM.YYYY");

  const isNewlyPosted = (date: Date | string) => dayjs().diff(date, "day") <= 7;

  return (
    <Card style={styles.container}>
      <View style={styles.parent}>
        <View style={styles.thumbnailContainer}>
          <Image
            style={styles.thumbnail}
            source={{
              uri: fields?.["Product Image"] || PlaceHolderImage
            }}
          />
        </View>

        <View style={styles.contentConatiner}>
          <View style={{ flexDirection: "row" }}>
            <Card.Title
              subtitleStyle={styles.subtitle}
              titleStyle={styles.title}
              title={fields?.["Product Name"]}
              subtitle={formatDate(fields?.Posted)}
              style={{ width: isNewlyPosted(fields?.Posted) ? "75%" : "100%" }}
            />
            {isNewlyPosted(fields?.Posted) ? (
              <Chip style={styles.newChip} textStyle={{ color: "#fff" }}>
                NEW
              </Chip>
            ) : null}
          </View>

          <View style={styles.categoryContainer}>
            {fields?.["Product Categories"]
              ?.split(",")
              ?.slice(0, 3)
              ?.map((category, idx) => (
                <Chip key={idx} style={styles.category}>
                  {category}
                </Chip>
              ))}
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: "#f8f9fc"
  },
  parent: {
    height: 150,
    display: "flex",
    flexDirection: "row"
  },
  thumbnailContainer: {
    width: "30%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  thumbnail: {
    width: "90%",
    height: "90%",
    borderRadius: 5
  },
  contentConatiner: {
    width: "70%"
  },
  title: {
    fontWeight: "bold"
  },
  subtitle: {
    fontSize: 14,
    color: "#1b2633"
  },
  newChip: {
    height: 35,
    marginTop: 5,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 0,
    backgroundColor: "#333333",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  categoryContainer: {
    flexWrap: "wrap",
    marginHorizontal: 10,
    flexDirection: "row"
  },
  category: {
    margin: 2,
    backgroundColor: "#d5e5ff"
  }
});

export default ProductItem;
