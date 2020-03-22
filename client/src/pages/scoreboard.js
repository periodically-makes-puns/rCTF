import { useState, useEffect, useCallback } from 'preact/hooks'
import config from '../../../config/client'
import withStyles from '../components/jss'
import Pagination from '../components/pagination'

import { getScoreboard } from '../api/scoreboard'

const PAGESIZE_OPTIONS = [25, 50, 100]

const Scoreboard = withStyles({
  frame: {
    paddingBottom: '10px'
  }
}, ({ classes }) => {
  const [pageSize, _setPageSize] = useState(100)
  const [scores, setScores] = useState([])
  const [division, setDivision] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const setPageSize = useCallback((newPageSize) => {
    _setPageSize(newPageSize)
    // Try to switch to the page containing the teams that were previously
    // at the top of the current page
    setPage(Math.floor((page - 1) * pageSize / newPageSize) + 1)
  }, [pageSize, _setPageSize, page, setPage])

  const divisionChangeHandler = useCallback((e) => setDivision(e.target.value), [setDivision])
  const pageSizeChangeHandler = useCallback((e) => setPageSize(e.target.value), [setPageSize])

  useEffect(() => { document.title = `Scoreboard${config.ctfTitle}` }, [])
  useEffect(() => {
    const _division = division === '' ? undefined : division
    getScoreboard({
      division: _division,
      offset: (page - 1) * pageSize,
      limit: pageSize
    })
      .then(data => {
        setScores(data.leaderboard)
        setTotalItems(data.total)
      })
  }, [division, page, pageSize])

  return (
    <div class='row u-center' style='align-items: initial !important'>
      <div class='col-3'>
        <div class={`frame ${classes.frame}`}>
          <div class='frame__body'>
            <div class='frame__title'>Config</div>
            <div class='frame__subtitle'>Division</div>
            <div class='input-control'>
              <select required class='select' name='division' value={division} onChange={divisionChangeHandler}>
                <option value='' selected>All</option>
                <option value='0'>High School</option>
                <option value='1'>College</option>
                <option value='2'>Other</option>
              </select>
            </div>
            <div class='frame__subtitle'>Teams per page</div>
            <div class='input-control'>
              <select required class='select' name='pagesize' value={pageSize} onChange={pageSizeChangeHandler}>
                { PAGESIZE_OPTIONS.map(sz => <option value={sz}>{sz}</option>) }
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class='col-6'>
        <div class={`frame ${classes.frame}`} style='padding-top: 25px'>
          <div class='frame__body'>
            <table class='table small'>
              <thead>
                <tr>
                  <th style='width: 10px'>#</th>
                  <th>Team</th>
                  <th style='width: 50px'>Points</th>
                </tr>
              </thead>
              <tbody>
                {
                  scores.map(({ id, name, score }, idx) =>
                    <tr key={id}>
                      <td>{idx + 1 + (page - 1) * pageSize}</td>
                      <td>
                        <a href={`/profile/${id}`}>{name}</a>
                      </td>
                      <td>{score}</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div>
          { totalItems > pageSize &&
            <Pagination
              totalItems={totalItems}
              pageSize={pageSize}
              page={page}
              setPage={setPage}
              numVisiblePages={9}
            />
          }
        </div>
      </div>
    </div>
  )
})

export default Scoreboard
