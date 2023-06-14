import React, { useContext, useEffect, useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
  SafeAreaView,
  ActivityIndicator
} from 'react-native'
import { VictoryPie } from 'victory-native'
import { Svg } from 'react-native-svg'
import { useRoute } from '@react-navigation/native'
import { COLORS, SIZES, icons } from '../constants'
import { ScrollView } from 'react-native-virtualized-view'
import { firestore, auth } from '../firebaseConfig.js'
import { AntDesign } from '@expo/vector-icons'
import themeConfig from '../themeConfig'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Feather } from '@expo/vector-icons'
import Context from './Context'

const Stats = () => {
  const route = useRoute()
  const [categories, setCategories] = useState([])
  const [viewMode, setViewMode] = React.useState('chart')
  const [selectedCategory, setSelectedCategory] = React.useState(null)
  const [showMoreToggle, setShowMoreToggle] = React.useState(false)
  const [transactions, setTransactions] = useState([])
  const [reloads, setReloads] = useState(false)
  const [chartData, setChartData] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(false)


  const { reload, setReload } = useContext(Context);

  function processData (data) {
    const processedData = []
    let totalExpense = 0
    let categorizedExpenses = {}

    for (const transaction of data) {
      totalExpense += transaction.transactionAmount
      if (!transaction.expenseCount) {
        transaction.expenseCount = 0
      }
    }

    for (const transaction of data) {
      const { transactionCategory, transactionAmount, expenseCount } =
        transaction
      if (!categorizedExpenses[transactionCategory]) {
        const min = 1000000
        const max = 9999999
        const id = Math.floor(Math.random() * (max - min + 1)) + min
        const label = `${((transactionAmount / totalExpense) * 100).toFixed(
          1
        )}%`

        categorizedExpenses[transactionCategory] = {
          name: transactionCategory,
          y: transactionAmount,
          expenseCount: 1,
          color: getRandomColor(transactionCategory),
          id: id
        }
      } else {
        categorizedExpenses[transactionCategory].y += transactionAmount
        categorizedExpenses[transactionCategory].expenseCount += 1
      }
    }
    for (const key in categorizedExpenses) {
      categorizedExpenses[key].label = `${(
        (categorizedExpenses[key].y / totalExpense) *
        100
      ).toFixed(1)}%`
      processedData.push(categorizedExpenses[key])
    }
    return processedData
  }

  function organizedCategory (data) {
    const categoriesData = []

    data.forEach(item => {
      const categoryIndex = categoriesData.findIndex(
        cat => cat.name === item.transactionCategory
      )

      if (categoryIndex === -1) {
        const category = {
          id: categoriesData.length + 1,
          name: item.transactionCategory,
          expenses: []
        }

        categoriesData.push(category)
      }

      const expense = {
        id: item.id,
        title: '',
        description: item.transactionDescription,
        date: item.transactionDate,
        total: item.transactionAmount
      }

      const category = categoriesData.find(
        cat => cat.name === item.transactionCategory
      )
      category.expenses.push(expense)
    })

    return categoriesData
  }

  function getRandomColor (category) {
    const categoryColors = {
      Debt: '#003f5c',
      Food: '#2f4b7c',
      Transportation: '#4CAF50',
      Clothing: '#a05195',
      Education: '#d45087',
      Bill: '#d45087',
      Gift: '#ff7c43',
      Vacation: '#ffa600',

      Health: '#00BCD4',
      Other: '#607D8B',

      Salary: '#003f5c',
      Freelancing: '#2f4b7c',
      Inheritance: '#a05195',
      Allowance: '#d45087'
    }

    return categoryColors[category] || '#000000'
  }

  useEffect(() => {
    const fetchExpenseTransactions = async () => {
      setLoading(true)
      const transactionsCollectionRef = collection(firestore, 'transactions')
      const userID = auth.currentUser.uid

      const q = query(
        transactionsCollectionRef,
        where('userID', '==', userID),
        where('transactionType', '==', 'Expense')
      )
      const currentYear = selectedDate.getFullYear()
      const currentMonthAbbreviation = selectedDate.toLocaleString('default', {
        month: 'short'
      })
      try {
        const querySnapshot = await getDocs(q)
        const transactionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        const filteredDocs = transactionsData.filter(doc => {
          const transactionDate = doc.transactionDate
          const transactionYear = new Date(transactionDate).getFullYear()
          return (
            transactionDate.includes(currentMonthAbbreviation) &&
            transactionYear === currentYear
          )
        })

        setTransactions(filteredDocs)

        let procdata = processData(filteredDocs)
        setChartData(procdata)
        setLoading(false)
      } catch (error) {
        console.error('Error retrieving transactions:', error)
      }
    }

    const fetchIncomeTransactions = async () => {
      setLoading(true)
      const transactionsCollectionRef = collection(firestore, 'transactions')
      const userID = auth.currentUser.uid

      const q = query(
        transactionsCollectionRef,
        where('userID', '==', userID),
        where('transactionType', '==', 'Income')
      )
      const currentYear = selectedDate.getFullYear()
      const currentMonthAbbreviation = selectedDate.toLocaleString('default', {
        month: 'short'
      })
      try {
        const querySnapshot = await getDocs(q)
        const transactionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        const filteredDocs = transactionsData.filter(doc => {
          const transactionDate = doc.transactionDate
          const transactionYear = new Date(transactionDate).getFullYear()
          return (
            transactionDate.includes(currentMonthAbbreviation) &&
            transactionYear === currentYear
          )
        })

        setTransactions(filteredDocs)

        let procdata = processData(filteredDocs)
        setChartData(procdata)
        setLoading(false)
      } catch (error) {
        console.error('Error retrieving transactions:', error)
      }
    }

    if (page == false) {
      fetchExpenseTransactions()
    } else if (page == true) {
      fetchIncomeTransactions()
    }

    setReloads(false)
    setReload(false)
  }, [reload, reloads, page])

  function renderCategoryHeaderSection () {
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: SIZES.padding,
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <View>
          <Text style={{ color: COLORS.primary }}>
            {page ? 'Income' : 'Expenses'}{' '}
          </Text>
          <Text style={{ color: COLORS.darkgray }}>
            {chartData.length} Total
          </Text>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: viewMode == "chart" ? themeConfig.primary : COLORS.lightGray2,
              height: 50,
              width: 50,
              borderRadius: 25
            }}
            onPress={() => {
              setViewMode('chart')
              setPage(false)
            }}
          >
            <Feather
              name='dollar-sign'
              size={20}
              color={viewMode === 'chart' ?  themeConfig.white : themeConfig.primary }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: viewMode == "list" ? themeConfig.primary : COLORS.lightGray2,
              height: 50,
              width: 50,
              borderRadius: 25,
              marginLeft: SIZES.base
            }}
            onPress={() => {
              setViewMode('list')
              setPage(true)
            }}
          >
            <Feather
              name='activity'
              size={20}
              color={viewMode === 'list' ? themeConfig.white : themeConfig.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  function renderCategoryList () {
    const CatData = organizedCategory(transactions)
    const renderItem = ({ item }) => (
      <TouchableOpacity
        onPress={() => setSelectedCategory(item)}
        style={{
          flex: 1,
          flexDirection: 'row',
          margin: 5,
          paddingVertical: SIZES.radius,
          paddingHorizontal: SIZES.padding,
          borderRadius: 5,
          backgroundColor: COLORS.white
        }}
      >
        <View
          style={{ flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <Text style={{ marginLeft: SIZES.base, color: COLORS.primary }}>
            {item.transactionCategory}
          </Text>
          <Text style={{ marginLeft: SIZES.base, color: COLORS.primary }}>
            {item.transactionDate}
          </Text>
          <Text style={{ marginLeft: SIZES.base, color: COLORS.primary }}>
            {item.transactionAmount}
          </Text>
        </View>
      </TouchableOpacity>
    )

    return (
      <SafeAreaView>
        <ScrollView>
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={item => `${item.id}`}
            numColumns={2}
          />
        </ScrollView>
      </SafeAreaView>
    )
  }

  function setSelectCategoryByName (name) {
    let category = categories.filter(a => a.name == name)
    setSelectedCategory(category[0])
  }

  function renderChart () {
    // let chartData = processCategoryDataToDisplay();

    let colorScales = chartData.map(item => item.color)
    let totalExpenseCount = chartData.reduce(
      (a, b) => a + (b.expenseCount || 0),
      0
    )

    if (Platform.OS == 'ios') {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
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
              labels: { fill: 'white' }
            }}
            width={SIZES.width * 0.8}
            height={SIZES.width * 0.8}
            colorScale={colorScales}
            events={[
              {
                target: 'data',
                eventHandlers: {
                  onPress: () => {
                    return [
                      {
                        target: 'labels',
                        mutation: props => {
                          let categoryName = chartData[props.index].name
                          setSelectCategoryByName(categoryName)
                        }
                      }
                    ]
                  }
                }
              }
            ]}
          />

          <View style={{ position: 'absolute', top: '42%', left: '42%' }}>
            <Text style={{ textAlign: 'center' }}>{chartData.length} </Text>
            <Text style={{ textAlign: 'center' }}>Expenses</Text>
          </View>
        </View>
      )
    } else {
      // Android workaround by wrapping VictoryPie with SVG
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Svg
            width={SIZES.width}
            height={SIZES.width}
            style={{ width: '100%', height: 'auto' }}
          >
            <VictoryPie
              standalone={false} // Android workaround
              data={chartData}
              labels={datum => `${datum.y}`}
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
                labels: { fill: 'white' }
              }}
              width={SIZES.width}
              height={SIZES.width}
              colorScale={colorScales}
              events={[
                {
                  target: 'data',
                  eventHandlers: {
                    onPress: () => {
                      return [
                        {
                          target: 'labels',
                          mutation: props => {
                            let categoryName = chartData[props.index].name
                            setSelectCategoryByName(categoryName)
                          }
                        }
                      ]
                    }
                  }
                }
              ]}
            />
          </Svg>
          <View style={{ position: 'absolute', top: '42%', left: '38%' }}>
            <Text style={{ textAlign: 'center' }}>{chartData.length}</Text>
            <Text style={{ textAlign: 'center' }}>Transactions</Text>
          </View>
        </View>
      )
    }
  }

  function renderExpenseSummary () {
    // let data = processCategoryDataToDisplay();

    const renderItem = ({ item }) => (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          height: 40,
          paddingHorizontal: SIZES.radius,
          borderRadius: 10,
          backgroundColor:
            selectedCategory && selectedCategory.name == item.name
              ? item.color
              : COLORS.white
        }}
        onPress={() => {
          let categoryName = item.name

          setSelectCategoryByName(categoryName)
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor:
                selectedCategory && selectedCategory.name == item.name
                  ? COLORS.white
                  : item.color,
              borderRadius: 5
            }}
          />

          <Text
            style={{
              marginLeft: SIZES.base,
              color:
                selectedCategory && selectedCategory.name == item.name
                  ? COLORS.white
                  : COLORS.primary
            }}
          >
            {item.name}
          </Text>
        </View>

        <View style={{ justifyContent: 'center' }}>
          <Text
            style={{
              color:
                selectedCategory && selectedCategory.name == item.name
                  ? COLORS.white
                  : COLORS.primary
            }}
          >
            {item.y} Rs. - {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    )

    return (
      <View style={{ padding: SIZES.padding }}>
        <FlatList
          data={chartData}
          renderItem={renderItem}
          keyExtractor={item => `${item.id}`}
        />
      </View>
    )
  }

  const goToPreviousMonth = () => {
    const prevMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1,
      1
    )
    setSelectedDate(prevMonth)
    setReloads(true)
  }

  const goToNextMonth = () => {
    const nextMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      1
    )
    setSelectedDate(nextMonth)
    setReloads(true)
  }

  const goToPreviousYear = () => {
    const prevYear = new Date(
      selectedDate.getFullYear() - 1,
      selectedDate.getMonth(),
      1
    )
    setSelectedDate(prevYear)
    setReloads(true)
  }

  const goToNextYear = () => {
    const nextYear = new Date(
      selectedDate.getFullYear() + 1,
      selectedDate.getMonth(),
      1
    )
    setSelectedDate(nextYear)
    setReloads(true)
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.lightGray2,
        alignItems: 'stretch',
        justifyContent: 'space-between'
      }}
    >
      {renderCategoryHeaderSection()}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={goToPreviousYear}
        >
          <AntDesign name='banckward' size={24} color={themeConfig.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={goToPreviousMonth}
        >
          <AntDesign name='caretleft' size={24} color={themeConfig.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {selectedDate.toLocaleString('default', {
            month: 'long',
            year: 'numeric'
          })}
        </Text>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={goToNextMonth}
        >
          <AntDesign name='caretright' size={24} color={themeConfig.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={goToNextYear}
        >
          <AntDesign name='forward' size={24} color={themeConfig.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={themeConfig.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {viewMode === 'list' && (
            <View>
              {renderChart()}
              {renderExpenseSummary()}
            </View>
          )}
          {viewMode === 'chart' && (
            <View>
              {renderChart()}
              {renderExpenseSummary()}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navigationButton: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    color: themeConfig.primary
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    marginRight: 10
  }
})

export default Stats
