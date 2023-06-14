import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import AntDesign from '@expo/vector-icons/AntDesign'
import themeConfig from '../themeConfig'
import { auth, firestore } from '../firebaseConfig'
import { getDoc, doc, updateDoc } from 'firebase/firestore'
import Context from './Context'

const Home = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [budgetLeft, setBudgetLeft] = useState(0)
  const [updatedBudget, setUpdatedBudget] = useState('')
  const { reload, setReload } = useContext(Context)

  useEffect(() => {
    const fetchBudgetValues = async () => {
      try {
        const userId = auth.currentUser.uid
        const budgetDocRef = doc(firestore, 'users', userId)
        const budgetSnapshot = await getDoc(budgetDocRef)

        if (budgetSnapshot.exists()) {
          const budgetData = budgetSnapshot.data()
          setTotalBudget(budgetData.budgetTotal || 0)
          setBudgetLeft(budgetData.budgetLeft || 0)
          setTotalIncome(budgetData.incomeTotal || 0)
          setTotalExpense(budgetData.expenseTotal || 0)
        }
      } catch (error) {
        console.log('Error retrieving budget values:', error)
      }
    }

    fetchBudgetValues()
    setReload(false)
  }, [reload])

  const handleDateSelection = date => {
    setSelectedDate(date)
  }

  const goToPreviousMonth = () => {
    const prevMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1,
      1
    )
    setSelectedDate(prevMonth)
  }

  const goToNextMonth = () => {
    const nextMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      1
    )
    setSelectedDate(nextMonth)
  }

  const goToPreviousYear = () => {
    const prevYear = new Date(
      selectedDate.getFullYear() - 1,
      selectedDate.getMonth(),
      1
    )
    setSelectedDate(prevYear)
  }

  const goToNextYear = () => {
    const nextYear = new Date(
      selectedDate.getFullYear() + 1,
      selectedDate.getMonth(),
      1
    )
    setSelectedDate(nextYear)
  }

  const generateCalendarDays = () => {
    const days = []

    const currentMonth = selectedDate.getMonth()
    const currentYear = selectedDate.getFullYear()

    const numDays = new Date(currentYear, currentMonth + 1, 0).getDate()

    for (let day = 1; day <= numDays; day++) {
      const date = new Date(currentYear, currentMonth, day)

      days.push(
        <TouchableOpacity
          key={date}
          style={[
            styles.dayContainer,
            date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getFullYear() === selectedDate.getFullYear() &&
              styles.selectedDay
          ]}
          onPress={() => handleDateSelection(date)}
        >
          <Text
            style={[
              styles.dayText,
              date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear() &&
                styles.selectedDayText
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      )
    }

    return days
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const handleButtonPress = () => {
    navigation.navigate('Detail', { date: selectedDate.getTime() })
  }

  const updateBudget = async value => {
    try {
      const userID = auth.currentUser.uid
      const userDocRef = doc(firestore, 'users', userID)
      const userDocSnapshot = await getDoc(userDocRef)

      if (userDocSnapshot.exists()) {
        const updatedBudgetTotal = parseFloat(value)
        const updatedBudgetLeft = updatedBudgetTotal - totalExpense

        await updateDoc(userDocRef, {
          budgetTotal: updatedBudgetTotal,
          budgetLeft: updatedBudgetLeft
        })

        setTotalBudget(updatedBudgetTotal)
        setBudgetLeft(updatedBudgetLeft)
      }
    } catch (error) {
      console.error('Error updating budget:', error)
      alert('Failed to update the budget. Please try again.')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.rowHeadingNonEditable}>Total Income: </Text>
        <Text style={{color: themeConfig.gray}}>{String(totalIncome)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowHeadingNonEditable}>Total Expense:</Text>
        <Text style={{color: themeConfig.gray}}>{String(totalExpense)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowHeadingNonEditable}>Budget Left: </Text>
        <Text style={{color: themeConfig.gray}}>{String(budgetLeft)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowHeading}>Total Budget:</Text>
        <TextInput
          style={styles.rowInput}
          value={updatedBudget !== '' ? updatedBudget : String(totalBudget)}
          onChangeText={value => {
            setUpdatedBudget(value)
            setTotalBudget(value)
            setBudgetLeft(value - totalExpense)
          }}
          keyboardType='numeric'
          returnKeyType='done'
          onBlur={() => {
            if (updatedBudget !== '') {
              updateBudget(updatedBudget)
              setUpdatedBudget('')
              setBudgetLeft(totalBudget - totalExpense)
            }
          }}
        />
      </View>

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

      <View style={styles.calendarContainer}>{generateCalendarDays()}</View>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleButtonPress}
      >
        <Ionicons name='md-arrow-forward' size={30} color={themeConfig.white} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
        <Ionicons name='refresh' size={30} color={themeConfig.white} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    marginTop: 20
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  rowHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 20
  },
  rowHeadingNonEditable: {
    fontSize: 16,
    color: themeConfig.gray,
    marginHorizontal: 20,
    marginVertical: 5,
  },
  rowInput: {
    flex: 1,
    height: 40,
    width: '20%',
    borderColor: themeConfig.primary,
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 20,
    marginLeft: 10,
    paddingLeft: 10
  },
  rowDisplay: {
    flex: 1,
    height: 40,
    width: '20%',

    marginRight: 20,
    paddingLeft: 10
  },
  headerContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 0
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
  },
  calendarContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  dayContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: themeConfig.primary,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5
  },
  dayText: {
    fontSize: 16
  },
  selectedDay: {
    backgroundColor: themeConfig.primary
  },
  selectedDayText: {
    color: themeConfig.white
  },
  selectedDatesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: themeConfig.lightGray
  },
  selectedDatesText: {
    fontSize: 16
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: themeConfig.primary,
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8
  },
  todayButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: themeConfig.primary,
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8
  }
})

export default Home
