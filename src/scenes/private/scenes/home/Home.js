// @flow

import React, { useState, useCallback } from 'react'

/**
 * Components
 */
import Grid from '@material-ui/core/Grid'
import { Button } from '@material-ui/core'
import { Trans } from '@lingui/macro'
import Typography from '@material-ui/core/Typography'
import AddWordDialogForm from '../../components/AddWordDialogForm'
import AddListDialogForm from '../../components/AddListDialogForm'
import AddIcon from '@material-ui/icons/Add'
import Tooltip from '@material-ui/core/Tooltip'
import SearchWordForm from './components/SearchWordForm'
import WordsList from './components/WordsList'
import Select from 'react-select'

/**
 * Utils
 */
import { map, filter, intersection } from 'lodash'
import { withStyles } from '@material-ui/core/styles'
import { removeFirebaseValue, addFirebaseValue, updateFirebaseValue } from '../../../../services/firebase'
import noWordsSvg from '../../assets/no-words.svg'
import type { FirebaseViewer } from '../../../../services/utils/types'

const styles = theme => ({
  pageContainer: {
    height: '100%'
  },
  fab: {
    position: 'fixed',
    right: 30,
    bottom: 30,
    zIndex: 1
  },
  emptyListPicture: {
    width: '100%',
    maxWidth: 450,
    marginBottom: theme.spacing.unit * 3
  },
  emptyContainer: {
    textAlign: 'center',
    height: 'calc(100% - 70px)'
  },
  emptyContainerActions: {
    marginTop: theme.spacing.unit * 4
  },
  listContainer: {
    paddingTop: theme.spacing.unit
  },
  filtersContainer: {
    marginBottom: theme.spacing.unit * 2
  }
})

const filterWords = ({ words, listsFilters, searchFilter }) => {
  return filter(words, ({ list }) => {
    if (listsFilters.length && list) {
      return intersection(list, listsFilters).length === listsFilters.length
    } else {
      return true
    }
  }).filter(({ kana, kanji, traduction, secondaryTraduction }) => {
    if (searchFilter) {
      return [
        kana,
        kanji,
        traduction.toLowerCase(),
        secondaryTraduction ? secondaryTraduction.toLowerCase() : ''
      ].includes(searchFilter.toLowerCase())
    } else {
      return true
    }
  })
}

type HomeProps = {|
  classes: Object,
  viewer: FirebaseViewer,
  lists: Object,
  words: Object
|}

export default withStyles(styles)(({ classes, viewer, lists, words }: HomeProps) => {
  const [isAddWordDialogVisible, setIsAddWordDialogVisible] = useState(false)
  const [isAddListDialogVisible, setIsAddListDialogVisible] = useState(false)
  const [editedWord, setEditedWord] = useState(null)
  const [listsFilter, setListsFilter] = useState([])
  const [wordFilter, setWordFilter] = useState('')
  const hasWords = words !== undefined && words !== null
  const f = useCallback(() => filterWords({ words, searchFilter: wordFilter, listsFilters: listsFilter }), [
    words,
    listsFilter,
    wordFilter
  ])
  const wordsList = words ? f() : null

  const listsOptions = map(lists, list => ({
    label: list.name,
    value: list.id
  }))

  function toggleListDialog () {
    setIsAddListDialogVisible(!isAddListDialogVisible)
  }

  function toggleAddWordDialog () {
    setIsAddWordDialogVisible(!isAddWordDialogVisible)
  }

  function removeWord (id) {
    removeFirebaseValue(`users/${viewer.uid}/words/${id}`)
  }

  function addListOnSubmit (values) {
    const id = Date.now().toString()

    addFirebaseValue(`users/${viewer.uid}/lists/${id}`, {
      id,
      name: values.name
    })
  }

  function onWordCreation (values) {
    const id = Date.now().toString()

    addFirebaseValue(`users/${viewer.uid}/words/${id}`, {
      ...values,
      id,
      list: values.list ? values.list.map(option => option.value) : null
    })
  }

  function onWordEdition (values) {
    if (editedWord) {
      updateFirebaseValue(`users/${viewer.uid}/words/${editedWord.id}`, {
        ...values,
        list: values.list ? values.list.map(option => option.value) : null
      })
    }
  }

  return (
    <div className={classes.pageContainer}>
      {hasWords ? (
        <Tooltip title={<Trans>Add a new word</Trans>}>
          <Button variant='fab' color='primary' aria-label='Add' className={classes.fab} onClick={toggleAddWordDialog}>
            <AddIcon />
          </Button>
        </Tooltip>
      ) : null}

      {hasWords ? (
        <div className={classes.filtersContainer}>
          <Grid container spacing={16}>
            <Grid item xs={12} md={4}>
              <SearchWordForm onSearch={({ search }) => setWordFilter(search)} />
            </Grid>

            {lists === undefined ? null : lists ? (
              <Grid item xs={12} md={5}>
                <Select
                  isMulti
                  options={listsOptions}
                  styles={{
                    menu: provided => ({
                      ...provided,
                      zIndex: 100000
                    }),
                    input: () => ({
                      height: 50,
                      lineHeight: '50px'
                    })
                  }}
                  placeholder={<Trans>Search lists</Trans>}
                  onChange={values => setListsFilter(values.map(({ value }) => value))}
                />
              </Grid>
            ) : (
              <Button color='primary' onClick={toggleListDialog} variant='contained'>
                <Trans>Add a list</Trans>
              </Button>
            )}
          </Grid>
        </div>
      ) : null}

      <div className={classes.listContainer}>
        {words === undefined ? null : wordsList ? (
          <WordsList
            lists={lists}
            words={wordsList}
            onWordDelete={word => removeWord(word.id)}
            onWordEdit={word => {
              setEditedWord(word)
              toggleAddWordDialog()
            }}
          />
        ) : (
          <Grid container alignItems='center' justify='center' className={classes.emptyContainer}>
            <Grid item xs={5}>
              <img src={noWordsSvg} alt='No words' className={classes.emptyListPicture} />
              <Typography component='h3' variant='h4' gutterBottom>
                <Trans>No words yet</Trans>
              </Typography>
              <div className={classes.emptyContainerActions} />
              <Button variant='contained' color='primary' onClick={toggleAddWordDialog}>
                <Trans>Add my first word</Trans>
              </Button>
              &nbsp;
              <Button color='primary' onClick={toggleListDialog}>
                <Trans>Add a list</Trans>
              </Button>
            </Grid>
          </Grid>
        )}
      </div>

      {isAddWordDialogVisible ? (
        <AddWordDialogForm
          isVisible={isAddWordDialogVisible}
          onClose={() => {
            toggleAddWordDialog()
            setEditedWord(null)
          }}
          initialValues={
            editedWord
              ? {
                ...editedWord,
                list: editedWord.list
                  ? editedWord.list.map(listId => ({
                    label: lists[listId].name,
                    value: lists[listId].id
                  }))
                  : null
              }
              : null
          }
          lists={listsOptions}
          onCreate={onWordCreation}
          onEdit={onWordEdition}
        />
      ) : null}
      {isAddListDialogVisible && typeof lists !== 'undefined' ? (
        <AddListDialogForm
          isVisible={isAddListDialogVisible}
          onClose={toggleListDialog}
          onSubmit={addListOnSubmit}
          lists={lists}
        />
      ) : null}
    </div>
  )
})
