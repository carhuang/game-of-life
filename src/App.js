import React, { Component } from 'react';

const num_rows = 50
const num_cols = 50

const newBoardStatus = (cellStatus = () => Math.random() < 0.2) => {
  const grid = []
  for (let r = 0; r < num_rows; r++) {
    grid[r] = []
    for (let c = 0; c < num_cols; c++) {
      grid[r][c] = cellStatus()
    }
  }
  return grid
}

const BoardGrid = ({ boardStatus, onToggleCellStatus }) => {
    const handleClick = (r, c) => onToggleCellStatus(r,c)

    const tr = []
    for (let r = 0; r < num_rows; r++) {
      const td = []
      for (let c = 0; c < num_cols; c++) {
        td.push(
          <td 
          key={`${r},${c}`} 
          className={boardStatus[r][c]? 'alive' : 'dead'} 
          onClick={() => handleClick(r,c)}></td>
        )
      }
      tr.push(
        <tr key={r}>{td}</tr>
      )
    }
    return <table><tbody>{tr}</tbody></table>

}

const Slider = ({speed, onSpeedChange}) => {
  const handleChange = e => onSpeedChange(e.target.value)

  return (
    <input 
    type='range' 
    min='50' 
    max='1000' 
    step='50' 
    value={speed} 
    onChange={handleChange} 
    />
  )
}

class App extends Component {
  state = {
    boardStatus: newBoardStatus(),
    generation: 0,
    isGameRunning: false,
    speed: 500
  }

  runStopButton = () => {
    return this.state.isGameRunning ? 
    <button type='button' onClick={this.handleStop}>Stop</button> : 
    <button type='button' onClick={this.handleRun}>Run</button>
  }

  handleClearBoard = () => {
    this.setState({
      boardStatus: newBoardStatus(() => false),
      generation: 0
    })
  }

  handleNewBoard = () => {
    this.setState({
      boardStatus: newBoardStatus(),
      generation: 0
    })
  }

  handleToggleCellStatus = (r,c) => {
    const toggleBoardStatus = prevState => {
      const clonedBoardStatus = JSON.parse(JSON.stringify(prevState.boardStatus))
      clonedBoardStatus[r][c] = !clonedBoardStatus[r][c]
      return clonedBoardStatus
    }

    this.setState(prevState => ({
      boardStatus: toggleBoardStatus(prevState)
    }))
  }

  handleStep = () => {
    const nextStep = prevState => {
      const boardStatus = prevState.boardStatus
      const clonedBoardStatus = JSON.parse(JSON.stringify(boardStatus))

      const amountTrueNaighbors = (r,c) => {
        const neighbors = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
        return neighbors.reduce((trueNeighbors, neighbor) => {
          const x = r + neighbor[0]
          const y = c + neighbor[1]
          const isNeighborOnBoard = (x >= 0 && x < num_rows && y >= 0 && y < num_cols)
          if (trueNeighbors < 4 && isNeighborOnBoard && boardStatus[x][y]) {
            return trueNeighbors + 1
          } else {
            return trueNeighbors
          }
        }, 0)
      }

      for (let r = 0; r <  num_rows; r++) {
        for (let c = 0; c < num_cols; c++) {
          const totalTrueNeighbors = amountTrueNaighbors(r,c)
          if (!boardStatus[r][c]) {
            if (totalTrueNeighbors === 3) clonedBoardStatus[r][c] = true
          } else {
            if (totalTrueNeighbors < 2 || totalTrueNeighbors > 3) clonedBoardStatus[r][c] = false
          }
        }
      }

      return clonedBoardStatus
    }

    this.setState(prevState => ({
      boardStatus: nextStep(prevState),
      generation: prevState.generation + 1
    }))  
  }

  handleSpeedChange = newSpeed => {
    this.setState({speed: newSpeed})
  }

  handleRun = () => {
    this.setState({isGameRunning: true})
  }

  handleStop = () => {
    this.setState({isGameRunning: false})
  }

  componentDidUpdate(prevProps, prevState) {
    const { isGameRunning, speed } =  this.state
    const speedChanged = prevState.speed !== speed
    const gameStarted = !prevState.isGameRunning && isGameRunning
    const gameStopped = prevState.isGameRunning && !isGameRunning

    if ((isGameRunning && speedChanged) || gameStopped) {
      clearInterval(this.timerID)
    }
    if ((isGameRunning && speedChanged) || gameStarted) {
      this.timerID = setInterval(() => {
        this.handleStep()
      }, speed)
    }
  }
  
  render() {
    const { boardStatus, isGameRunning, generation, speed } = this.state

    return (
      <div>
        <h1>Game of Life</h1>
        <BoardGrid boardStatus={boardStatus} onToggleCellStatus={this.handleToggleCellStatus} />
        <div className='flexRow upperControls'>
          <span>
            {'+ '}
            <Slider speed={speed} onSpeedChange={this.handleSpeedChange} />
            {' -'}
          </span>
          {`Generation: ${generation}`}
        </div>
        <div className='flexRow lowerControls'>
          {this.runStopButton()}
          <button type='button' disabled={isGameRunning} onClick={this.handleStep}>Step</button>
          <button type='button' onClick={this.handleClearBoard}>Clear Board</button>
          <button type='button' onClick={this.handleNewBoard}>New Board</button>
        </div>
      </div>
    )
  }
}

export default App;
