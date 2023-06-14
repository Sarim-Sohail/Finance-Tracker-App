import React, { useRef, useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
  SafeAreaView,
} from "react-native";
import { VictoryPie } from "victory-native";
import { Svg } from "react-native-svg";
import { Feather } from '@expo/vector-icons'
import { useRoute } from "@react-navigation/native";
import { COLORS, FONTS, SIZES, icons, images } from "../constants";
import { ScrollView } from 'react-native-virtualized-view';
import { firestore, auth } from "../firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Context from "./Context";
import { Directions } from "react-native-gesture-handler";

const Stats = () => {

  const [item,setItems] = useState({});
  const route = useRoute();
  const date = route.params?.date;

  const formattedDate = date ? new Date(date) : new Date();
  // dummy data
  const confirmStatus = "C";
  const pendingStatus = "P";

  function processData(data) {
    const processedData = [];
    let totalExpense = 0;
    
    // Calculate the total expense and initialize the category totals
    for (const transaction of data) {
      totalExpense += transaction.transactionAmount;
      if (!transaction.expenseCount) {
        transaction.expenseCount = 0;
      }
    }
    
    // Iterate over each transaction in the data
    for (const transaction of data) {
      const { transactionCategory, transactionAmount, expenseCount } = transaction;
      
      const id = transactionCategory.toLowerCase().replace(/ /g, "-"); // Generate ID from category name
      const label = `${((transactionAmount / totalExpense) * 100).toFixed(2)}%`; // Calculate the percentage and create the label
      
      // Create the processed data object and push it to the processedData array
      processedData.push({
        name: transactionCategory,
        y: transactionAmount,
        expenseCount: expenseCount,
        color: getRandomColor(), // Generate a random color (you need to implement this function)
        id: id,
        label: label,
      });
      
      // Update the expenseCount for the category
      const category = processedData.find(item => item.name === transactionCategory);
      if (category) {
        category.expenseCount++;
      }
    }
    
    return processedData;
  }

  function OrganizedCategory(data) {

    const categoriesData = [];
  
    data.forEach((item) => {
      const categoryIndex = categoriesData.findIndex(
        (cat) => cat.name === item.transactionCategory
      );
  
      if (categoryIndex === -1) {
        const category = {
          id: categoriesData.length + 1,
          name: item.transactionCategory,
          expenses: [],
        };
  
        categoriesData.push(category);
      }
  
      const expense = {
        id: item.id,
        title: "",
        description: item.transactionDescription,
        date: item.transactionDate,
        total: item.transactionAmount,
      };
  
      const category = categoriesData.find(
        (cat) => cat.name === item.transactionCategory
      );
      category.expenses.push(expense);
    });
  
    return categoriesData;
  }
  
  // Function to generate a random color
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

    useEffect(() => {
      const fetchTransactions = async () => {
        const transactionsCollectionRef = collection(firestore, "transactions");
        const userID = auth.currentUser.uid;
  
        console.log(formattedDate.toDateString());
        const q = query(
          transactionsCollectionRef,
          where("userID", "==", userID),
          where("transactionDate", "==", formattedDate.toDateString())
        );
  
        try {
          const querySnapshot = await getDocs(q);
          const transactionsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          setTransactions(transactionsData);
          
          let procdata = processData(transactionsData);
          setChartData(procdata);
          // console.log(transactionsData);
          console.log(chartData);
        } catch (error) {
          console.error("Error retrieving transactions:", error);
        }
      };
  
      fetchTransactions();
      setReload(false);
    }, [reload]);

    const renderItem = ({ item }) => {
    const {
      id,
      transactionAmount,
      transactionCategory,
      transactionDate,
      transactionDescription,
      transactionType,
      userID,
    } = item;

    const amountTextStyle =
      transactionType === "Expense"
        ? [styles.transactionAmountText, styles.expenseAmountText]
        : [styles.transactionAmountText, styles.incomeAmountText];
    console.log(transactionCategory);
    return (
      <View style={styles.transactionItem}>
        <Text style={styles.transactionTypeText}>{transactionType}</Text>
        <View style={styles.transactionInfoContainer}>
          <Text style={styles.transactionCategoryText}>
            {transactionCategory}
          </Text>
          <Text style={styles.transactionDescriptionText}>
            {transactionDescription}
          </Text>
        </View>
        <Text style={[amountTextStyle]}>{transactionAmount}</Text>
        <TouchableOpacity
          onPress={() => {
            handleDelete(id, transactionType, transactionAmount);
          }}
          style={styles.deleteIconContainer}
        >
          <Feather name="trash" size={16} color="#888888" />
        </TouchableOpacity>
      </View>
    );
  };

  let categoriesData = [
    {
      id: 1,
      name: "Bills",
      icon: icons.education,
      color: COLORS.yellow,
      expenses: [
        {
          id: 1,
          title: "Tuition Fee",
          description: "Tuition fee",
          location: "ByProgrammers' tuition center",
          total: 100.0,
          status: pendingStatus,
        },
        {
          id: 2,
          title: "Arduino",
          description: "Hardward",
          location: "ByProgrammers' tuition center",
          total: 20.0,
          status: pendingStatus,
        },
        {
          id: 3,
          title: "Javascript Books",
          description: "Javascript books",
          location: "ByProgrammers' Book Store",
          total: 40.0,
          status: confirmStatus,
        },
        {
          id: 4,
          title: "PHP Books",
          description: "PHP books",
          location: "ByProgrammers' Book Store",
          total: 20.0,
          status: confirmStatus,
        },
      ],
    },
    {
      id: 2,
      name: "Nutrition",
      icon: icons.food,
      color: COLORS.lightBlue,
      expenses: [
        {
          id: 5,
          title: "Vitamins",
          description: "Vitamin",
          location: "ByProgrammers' Pharmacy",
          total: 25.0,
          status: pendingStatus,
        },

        {
          id: 6,
          title: "Protein powder",
          description: "Protein",
          location: "ByProgrammers' Pharmacy",
          total: 50.0,
          status: confirmStatus,
        },
      ],
    },
    {
      id: 3,
      name: "Child",
      icon: icons.baby_car,
      color: COLORS.darkgreen,
      expenses: [
        {
          id: 7,
          title: "Toys",
          description: "toys",
          location: "ByProgrammers' Toy Store",
          total: 25.0,
          status: confirmStatus,
        },
        {
          id: 8,
          title: "Baby Car Seat",
          description: "Baby Car Seat",
          location: "ByProgrammers' Baby Care Store",
          total: 100.0,
          status: pendingStatus,
        },
        {
          id: 9,
          title: "Pampers",
          description: "Pampers",
          location: "ByProgrammers' Supermarket",
          total: 100.0,
          status: pendingStatus,
        },
        {
          id: 10,
          title: "Baby T-Shirt",
          description: "T-Shirt",
          location: "ByProgrammers' Fashion Store",
          total: 20.0,
          status: pendingStatus,
        },
      ],
    },
    {
      id: 4,
      name: "Beauty & Care",
      icon: icons.healthcare,
      color: COLORS.peach,
      expenses: [
        {
          id: 11,
          title: "Skin Care product",
          description: "skin care",
          location: "ByProgrammers' Pharmacy",
          total: 10.0,
          status: pendingStatus,
        },
        {
          id: 12,
          title: "Lotion",
          description: "Lotion",
          location: "ByProgrammers' Pharmacy",
          total: 50.0,
          status: confirmStatus,
        },
        {
          id: 13,
          title: "Face Mask",
          description: "Face Mask",
          location: "ByProgrammers' Pharmacy",
          total: 50.0,
          status: pendingStatus,
        },
        {
          id: 14,
          title: "Sunscreen cream",
          description: "Sunscreen cream",
          location: "ByProgrammers' Pharmacy",
          total: 50.0,
          status: pendingStatus,
        },
      ],
    },
    {
      id: 5,
      name: "Sports",
      icon: icons.sports_icon,
      color: COLORS.purple,
      expenses: [
        {
          id: 15,
          title: "Gym Membership",
          description: "Monthly Fee",
          location: "ByProgrammers' Gym",
          total: 45.0,
          status: pendingStatus,
        },
        {
          id: 16,
          title: "Gloves",
          description: "Gym Equipment",
          location: "ByProgrammers' Gym",
          total: 15.0,
          status: confirmStatus,
        },
      ],
    },
    {
      id: 6,
      name: "Clothing",
      icon: icons.cloth_icon,
      color: COLORS.red,
      expenses: [
        {
          id: 17,
          title: "T-Shirt",
          description: "Plain Color T-Shirt",
          location: "ByProgrammers' Mall",
          total: 20.0,
          status: pendingStatus,
        },
        {
          id: 18,
          title: "Jeans",
          description: "Blue Jeans",
          location: "ByProgrammers' Mall",
          total: 50.0,
          status: confirmStatus,
        },
      ],
    },
  ];

  const categoryListHeightAnimationValue = useRef(
    new Animated.Value(115)
  ).current;

  const [categories, setCategories] = React.useState(categoriesData);
  const [viewMode, setViewMode] = React.useState("chart");
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [showMoreToggle, setShowMoreToggle] = React.useState(false);
  const [transactions, setTransactions] = useState([]);
  const { reload, setReload } = useContext(Context);
  const[chartData,setChartData] = useState([]);
  

  function renderHeader() {
    console.log(chartData);
    return (
      <View
        style={{
          paddingHorizontal: SIZES.padding,
          paddingVertical: SIZES.padding,
          backgroundColor: COLORS.white,
        }}
      >
        <View>
          <Text style={{ color: COLORS.primary }}>
            My Expenses
          </Text>
          <Text style={{ color: COLORS.darkgray }}>
            Summary 
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            marginTop: SIZES.padding,
            alignItems: "center",
          }}
        >
          {/* <View
            style={{
              backgroundColor: COLORS.lightGray,
              height: 50,
              width: 50,
              borderRadius: 25,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={icons.calendar}
              style={{
                width: 20,
                height: 20,
                tintColor: COLORS.lightBlue,
              }}
            />
          </View> */}

          {/* <View style={{ marginLeft: SIZES.padding }}>
            <Text style={{ color: COLORS.primary}}>
            
            </Text>
            <Text style={{  color: COLORS.darkgray }}>
              18 more than last month
            </Text>
          </View> */}
        </View>
      </View>
    );
  }

  

  

  function renderCategoryHeaderSection() {
    return (
      <View
        style={{
          flexDirection: "row",
          padding: SIZES.padding,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        
        <View>
          <Text style={{ color: COLORS.primary}}>CATEGORIES</Text>
          <Text style={{ color: COLORS.darkgray}}>
            {chartData.length} Total
          </Text>
        </View>

        
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: viewMode == "chart" ? COLORS.secondary : null,
              height: 50,
              width: 50,
              borderRadius: 25,
            }}
            onPress={() => setViewMode("chart")}
          >
            <Image
              source={icons.chart}
              resizeMode="contain"
              style={{
                width: 20,
                height: 20,
                tintColor: viewMode == "chart" ? COLORS.white : COLORS.darkgray,
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: viewMode == "list" ? COLORS.secondary : null,
              height: 50,
              width: 50,
              borderRadius: 25,
              marginLeft: SIZES.base,
            }}
            onPress={() => setViewMode("list")}
          >
            <Image
              source={icons.menu}
              resizeMode="contain"
              style={{
                width: 20,
                height: 20,
                tintColor: viewMode == "list" ? COLORS.white : COLORS.darkgray,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderCategoryList() {
    const CatData = OrganizedCategory(transactions)
    const renderItem = ({ item }) => (
    
  
      <TouchableOpacity
        onPress={() => setSelectedCategory(item)}
        style={{
          flex: 1,
          flexDirection: "row",
          margin: 5,
          paddingVertical: SIZES.radius,
          paddingHorizontal: SIZES.padding,
          borderRadius: 5,
          backgroundColor: COLORS.white,
          
        }}
      >
        {/* <Image
          source={item.icon}
          style={{
            width: 20,
            height: 20,
            tintColor: item.color,
          }}
        /> */}
        <View style={{flexDirection: 'column', justifyContent: 'space-between'}}>
        <Text
          style={{ marginLeft: SIZES.base, color: COLORS.primary}}
        >
          {item.transactionCategory}
        </Text>
        <Text
          style={{ marginLeft: SIZES.base, color: COLORS.primary}}
        >
          {item.transactionDate}
        </Text>
        <Text
          style={{ marginLeft: SIZES.base, color: COLORS.primary}}
        >
          {item.transactionAmount}
        </Text>
        </View>
        
      </TouchableOpacity>
    );

    return (
    <SafeAreaView>
      <ScrollView>
     
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.id}`}
            numColumns={2}
          />
        
      </ScrollView>
      </SafeAreaView>
    );
  }

  function renderIncomingExpensesTitle() {
    return (
      <View
        style={{
          height: 80,
          backgroundColor: COLORS.lightGray2,
          padding: SIZES.padding,
        }}
      >
        
        <Text style={{ color: COLORS.primary }}>
          INCOMING EXPENSES
        </Text>
        <Text style={{ color: COLORS.darkgray }}>12 Total</Text>
      </View>
    );
  }

  function renderIncomingExpenses() {
    let allExpenses = selectedCategory ? selectedCategory.expenses : [];
    let incomingExpenses = allExpenses.filter((a) => a.status == "P");

    const renderItem = ({ item, index }) => (
      <View
        style={{
          width: 300,
          marginRight: SIZES.padding,
          marginLeft: index == 0 ? SIZES.padding : 0,
          marginVertical: SIZES.radius,
          borderRadius: SIZES.radius,
          backgroundColor: COLORS.white,
          
        }}
      >
        
        <View
          style={{
            flexDirection: "row",
            padding: SIZES.padding,
            alignItems: "center",
          }}
        >
          <View
            style={{
              height: 50,
              width: 50,
              borderRadius: 25,
              backgroundColor: COLORS.lightGray,
              alignItems: "center",
              justifyContent: "center",
              marginRight: SIZES.base,
            }}
          >
            <Image
              source={selectedCategory.icon}
              style={{
                width: 30,
                height: 30,
                tintColor: selectedCategory.color,
              }}
            />
          </View>

          <Text style={{ color: selectedCategory.color }}>
            {selectedCategory.name}
          </Text>
        </View>

        
        <View style={{ paddingHorizontal: SIZES.padding }}>
          
          <Text style={{}}>{item.title}</Text>
          <Text
            style={{ flexWrap: "wrap", color: COLORS.darkgray }}
          >
            {item.description}
          </Text>

          
          <Text style={{ marginTop: SIZES.padding}}>
            Location
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Image
              source={icons.pin}
              style={{
                width: 20,
                height: 20,
                tintColor: COLORS.darkgray,
                marginRight: 5,
              }}
            />
            <Text
              style={{
                marginBottom: SIZES.base,
                color: COLORS.darkgray,
              
              }}
            >
              {item.location}
            </Text>
          </View>
        </View>

        
        <View
          style={{
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            borderBottomStartRadius: SIZES.radius,
            borderBottomEndRadius: SIZES.radius,
            backgroundColor: selectedCategory.color,
          }}
        >
          <Text style={{ color: COLORS.white}}>
            CONFIRM {item.total.toFixed(2)} USD
          </Text>
        </View>
      </View>
    );

    return (
      
      <View>
        {renderIncomingExpensesTitle()}

        {incomingExpenses.length > 0 && (
          <FlatList
            data={incomingExpenses}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}

        {incomingExpenses.length == 0 && (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 300,
            }}
          >
            <Text style={{ color: COLORS.primary}}>
              No Record
            </Text>
          </View>
        )}
      </View>
    );
  }

  function processCategoryDataToDisplay() {
    // Filter expenses with "Confirmed" status
    let chartData = categories.map((item) => {
      let confirmExpenses = item.expenses.filter((a) => a.status == "C");
      var total = confirmExpenses.reduce((a, b) => a + (b.total || 0), 0);

      return {
        name: item.name,
        y: total,
        expenseCount: confirmExpenses.length,
        color: item.color,
        id: item.id,
      };
    });

    // filter out categories with no data/expenses
    let filterChartData = chartData.filter((a) => a.y > 0);

    // Calculate the total expenses
    let totalExpense = filterChartData.reduce((a, b) => a + (b.y || 0), 0);

    // Calculate percentage and repopulate chart data
    let finalChartData = filterChartData.map((item) => {
      let percentage = ((item.y / totalExpense) * 100).toFixed(0);
      return {
        label: `${percentage}%`,
        y: Number(item.y),
        expenseCount: item.expenseCount,
        color: item.color,
        name: item.name,
        id: item.id,
      };
    });

    return finalChartData;
  }

  function setSelectCategoryByName(name) {
    let category = categories.filter((a) => a.name == name);
    setSelectedCategory(category[0]);
  }

  function renderChart() {
    // let chartData = processCategoryDataToDisplay();
    console.log(chartData);
    let colorScales = chartData.map((item) => item.color);
    let totalExpenseCount = chartData.reduce(
      (a, b) => a + (b.expenseCount || 0),
      0
    );

    if (Platform.OS == "ios") {
      return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <VictoryPie
  data={chartData}
  radius={({ datum }) =>
    selectedCategory && selectedCategory.name === datum.name
      ? SIZES.width * 0.4
      : SIZES.width * 0.4 - 10
  }
  innerRadius={70}
  labelRadius={({ innerRadius }) =>
    (SIZES.width * 0.4 + innerRadius) / 2.5
  }
  style={{
    labels: { fill: "white" },
  }}
  width={SIZES.width * 0.8}
  height={SIZES.width * 0.8}
  colorScale={colorScales}
  events={[
    {
      target: "data",
      eventHandlers: {
        onPress: () => {
          return [
            {
              target: "labels",
              mutation: (props) => {
                let categoryName = chartData[props.index].name;
                setSelectCategoryByName(categoryName);
              },
            },
          ];
        },
      },
    },
  ]}
/>

          <View style={{ position: "absolute", top: "42%", left: "42%" }}>
            <Text style={{ textAlign: "center" }}>
              {totalExpenseCount}
            </Text>
            <Text style={{ textAlign: "center" }}>
              Expenses
            </Text>
          </View>
        </View>
      );
    } else {
      // Android workaround by wrapping VictoryPie with SVG
      return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Svg
            width={SIZES.width}
            height={SIZES.width}
            style={{ width: "100%", height: "auto" }}
          >
            <VictoryPie
              standalone={false} // Android workaround
              data={chartData}
              labels={(datum) => `${datum.y}`}
              radius={({ datum }) =>
                selectedCategory && selectedCategory.name == datum.name
                  ? SIZES.width * 0.4
                  : SIZES.width * 0.4 - 10
              }
              innerRadius={70}
              labelRadius={({ innerRadius }) =>
                (SIZES.width * 0.4 + innerRadius) / 2.5
              }
              style={{
                labels: { fill: "white" },
                
              }}
              width={SIZES.width}
              height={SIZES.width}
              colorScale={colorScales}
              events={[
                {
                  target: "data",
                  eventHandlers: {
                    onPress: () => {
                      return [
                        {
                          target: "labels",
                          mutation: (props) => {
                            let categoryName = chartData[props.index].name;
                            setSelectCategoryByName(categoryName);
                          },
                        },
                      ];
                    },
                  },
                },
              ]}
            />
          </Svg>
          <View style={{ position: "absolute", top: "42%", left: "42%" }}>
            <Text style={{ textAlign: "center" }}>
              {totalExpenseCount}
            </Text>
            <Text style={{ textAlign: "center" }}>
              Expenses
            </Text>
          </View>
        </View>
      );
    }
  }

  function renderExpenseSummary() {
    // let data = processCategoryDataToDisplay();


    const renderItem = ({ item }) => (

      <TouchableOpacity
        style={{
          flexDirection: "row",
          height: 40,
          paddingHorizontal: SIZES.radius,
          borderRadius: 10,
          backgroundColor:
            selectedCategory && selectedCategory.name == item.name
              ? item.color
              : COLORS.white,
        }}
        onPress={() => {
          let categoryName = item.name;
          console.log(categoryName);
          setSelectCategoryByName(categoryName);
        }}
      >
        
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor:
                selectedCategory && selectedCategory.name == item.name
                  ? COLORS.white
                  : item.color,
              borderRadius: 5,
            }}
          />

          <Text
            style={{
              marginLeft: SIZES.base,
              color:
                selectedCategory && selectedCategory.name == item.name
                  ? COLORS.white
                  : COLORS.primary,
            
            }}
          >
            {item.name}
          </Text>
        </View>

        
        <View style={{ justifyContent: "center" }}>
          <Text
            style={{
              color:
                selectedCategory && selectedCategory.name == item.name
                  ? COLORS.white
                  : COLORS.primary,
            
            }}
          >
            {item.y} USD - {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <View style={{ padding: SIZES.padding }}>
        <FlatList
          data={chartData}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
        />
      </View>
    );
  }


  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGray2 }}>
     
      

      
      {renderHeader()}

     
      {renderCategoryHeaderSection()}

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {viewMode == "list" && (
          <View>
            {renderCategoryList()}
          </View>
        )}
        {viewMode == "chart" && (
          <View>
            {renderChart()}
            {renderExpenseSummary()}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: 'transparent',
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
});

export default Stats;