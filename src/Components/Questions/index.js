import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import OptionsPage from '../OptionsPage'
import Results from '../Results'
import Timer from '../Timer'
import './index.css'

const apiConstants = {
  success: 'SUCCESS',
  failure: 'FAILURE',
  loading: 'LOADING',
  initial: 'INITIAL',
}
class Questions extends Component {
  state = {
    questionsList: [],
    activeId: 0,
    apiStatus: apiConstants.initial,
    attempted: 0,
    correctAns: 1,
    wrongAns: 0,
    isCorrect: false,
    isButtonClicked: false,
    nxtBtnClicked: false,
    unattemptedQuestionsList: [],
    activeIndex: 0,
    buttonClickedddd: false,
  }

  componentDidMount() {
    this.getQuestions()
  }

  isCorrectClicked = isT => {
    this.setState(prevState => ({correctAns: prevState.correctAns + 1}))
    const {correctAns} = this.state
  }

  isWrongClicked = isW => {
    this.setState(prevState => ({wrongAns: prevState.wrongAns + 1}))
    const {wrongAns} = this.state
    console.log(wrongAns, 'LLLLLLLLLLLLLLL')
  }

  getQuestions = async () => {
    this.setState({apiStatus: apiConstants.loading})
    const url = 'https://apis.ccbp.in/assess/questions'
    const options = {
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok === true) {
      const data = await response.json()
      const updatedQuestions = data.questions.map(eachQuestion => ({
        questionText: eachQuestion.question_text,
        id: eachQuestion.id,
        optionType: eachQuestion.options_type,
        options: eachQuestion.options,
      }))
      this.setState({
        questionsList: updatedQuestions,
        apiStatus: apiConstants.success,
      })
      const {questionsList} = this.state
    } else if (response.ok === 401) {
      this.setState({apiStatus: apiConstants.failure})
    }
  }

  getUnAttemptedList = () => {
    const {
      nxtBtnClicked,
      isButtonClicked,
      questionsList,
      activeId,
      unattemptedQuestionsList,
    } = this.state

    if (isButtonClicked === false) {
      // console.log(questionsList[activeId])
      // console.log(unattemptedQuestionsList, 'clicked')
      this.setState(prevState => ({
        unattemptedQuestionsList: [
          ...prevState.unattemptedQuestionsList,
          questionsList[activeId],
        ],
      }))
    }
  }

  getButtonStatus = status => {
    this.setState({isButtonClicked: true})
  }

  onClickNextQuestion = () => {
    const {
      activeId,
      nxtBtnClicked,
      isButtonClicked,
      buttonClickedddd,
      attempted,
    } = this.state
    const {questionsList} = this.state
    if (nxtBtnClicked === true && isButtonClicked === true) {
      this.setState(prevState => ({
        attempted: prevState.attempted + 1,
      }))
    }
    this.setState({isButtonClicked: false})
    console.log(attempted)
    if (activeId < questionsList.length - 1) {
      console.log('next button clicked')
      const isNextBtnClicked = true
      this.setState(
        prevState => ({
          activeId: prevState.activeId + 1,
          nxtBtnClicked: isNextBtnClicked,
        }),
        this.getUnAttemptedList(),
      )
    }
  }

  getIsCorrect = isC => {
    this.setState({isCorrect: isC})
  }

  handleReloadClick = () => {
    window.location.reload()
  }

  renderFailureView = () => (
    <div className="failure-container">
      <div>
        <img
          src="https://res.cloudinary.com/dedvz7flb/image/upload/v1713586288/Group_7519_ee7dlx.png"
          alt="Images"
        />
        <h1>Something went wrong</h1>
        <p>Our server are busy please try again</p>
        <button
          type="button"
          onClick={this.handleReloadClick}
          className="retry-btn"
        >
          Retry
        </button>
      </div>
    </div>
  )

  getTheData = ans => {
    this.setState({selectedData: ans})
  }

  /* getCount = () => {
    const {nxtBtnClicked, isButtonClicked, attempted} = this.state
    if (nxtBtnClicked === true && isButtonClicked === true) {
      this.setState(prevState => ({
        attempted: prevState.attempted + 1,
      }))
    }
  } */

  onRedirectToResultsPage = async () => {
    const {history} = this.props
    const {
      correctAns,
      wrongAns,
      questionsList,
      unattemptedQuestionsList,
      attempted,
    } = this.state
    await this.getUnAttemptedList()
    history.push('/r', {
      cA: correctAns,
      wA: wrongAns,
      total: questionsList.length,
      uAL: unattemptedQuestionsList,
      Attemp: attempted,
    })
  }

  renderSuccessView = () => {
    const {
      questionsList,
      activeId,
      isCorrect,
      selectedData,
      nxtBtnClicked,
      attempted,
      correctAns,
      unattemptedQuestionsList,
    } = this.state
    const requiredList = questionsList[activeId]
    console.log(attempted, 'kkkkkk')
    return (
      <div className="container">
        <Header />
        <div className="question-count-container">
          <p className="para">
            Question {activeId + 1}/{questionsList.length}
          </p>
          <Timer />
        </div>
        {requiredList !== undefined && (
          <div>
            <h1 className="question-text">{requiredList.questionText}</h1>
            <ul style={{listStyleType: 'upper-alpha'}} className="ul-container">
              {requiredList.options.map(eachOption => (
                <OptionsPage
                  key={eachOption.id}
                  optionDetails={eachOption}
                  isCorrectss={eachOption.is_correct}
                  getIsCorrect={this.getIsCorrect}
                  getButtonStatus={this.getButtonStatus}
                  isCorrectClicked={this.isCorrectClicked}
                  isWrongClicked={this.isWrongClicked}
                  questionsList={questionsList}
                />
              ))}
            </ul>
          </div>
        )}
        <div className="nxt-btn-container">
          {questionsList.length === activeId + 1 ? (
            <button
              type="button"
              onClick={this.onRedirectToResultsPage}
              className="next-qtn-btn"
            >
              Submit Assessment
            </button>
          ) : (
            <button
              type="button"
              onClick={this.onClickNextQuestion}
              className="next-qtn-btn"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    )
  }

  renderLoadingView = () => (
    <div className="loader-container">
      <Loader type="Oval" color="#0b69ff" height="50" width="50" />
    </div>
  )

  render() {
    const {
      apiStatus,
      unattemptedQuestionsList,
      nxtBtnClicked,
      isButtonClicked,
      attempted,
    } = this.state
    switch (apiStatus) {
      case apiConstants.success:
        return this.renderSuccessView()
      case apiConstants.failure:
        return this.renderFailureView()
      case apiConstants.loading:
        return this.renderLoadingView()
      default:
        return null
    }
  }
}
export default Questions
