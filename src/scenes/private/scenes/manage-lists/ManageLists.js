// @flow

import React, { useState } from 'react'

/**
 * Components
 */
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import { Trans } from '@lingui/macro'
import ListItem from './components/ListItem'
import Grid from '@material-ui/core/Grid'
import AddListDialogForm from '../../components/AddListDialogForm'
import emptyListSvg from '../../assets/empty-list.svg'

/**
 * Utils
 */
import { map, filter } from 'lodash'
import {
  removeFirebaseValue,
  addFirebaseValue,
  updateFirebaseValue,
  setFirebaseValue
} from '../../../../services/firebase'
import type {
  FirebaseLists,
  FirebaseListItem,
  FirebaseViewer,
  FirebaseWordsList
} from '../../../../services/utils/types'

type ManageListsProps = {|
  lists: FirebaseLists,
  viewer: FirebaseViewer,
  words: FirebaseWordsList
|}

export default ({ lists, viewer, words }: ManageListsProps) => {
  const [isAddListDialogVisible, setIsAddListDialogVisible] = useState(false)

  function toggleListDialog () {
    setIsAddListDialogVisible(!isAddListDialogVisible)
  }

  function addListOnSubmit (values) {
    const id = Date.now().toString()

    addFirebaseValue(`users/${viewer.uid}/lists/${id}`, {
      id,
      name: values.name
    })
  }

  function updateList (listValue: FirebaseListItem, value) {
    updateFirebaseValue(`users/${viewer.uid}/lists/${listValue.id}`, value)
  }

  function removeList (listValue: FirebaseListItem) {
    filter(words, word => word.list && word.list.includes(listValue.id)).forEach(word => {
      setFirebaseValue(`users/${viewer.uid}/words/${word.id}/list`, word.list.filter(listId => listId !== listValue.id))
    })
    removeFirebaseValue(`users/${viewer.uid}/lists/${listValue.id}`)
  }

  return (
    <div>
      <Grid container alignItems='center' spacing={16} style={{ marginBottom: 15 }}>
        {lists ? (
          <React.Fragment>
            <Grid item xs='auto'>
              <Typography component='h1' variant='h3'>
                <Trans>Manage lists</Trans>
              </Typography>
            </Grid>
            <Grid item xs={12} sm='auto'>
              <Button variant='contained' color='primary' onClick={toggleListDialog}>
                <Trans>Create a list</Trans>
              </Button>
            </Grid>
          </React.Fragment>
        ) : null}
      </Grid>

      {lists ? (
        <Paper>
          <List>
            {map(lists, (list, i) => (
              <ListItem key={i} lists={lists} value={list} onRemove={removeList} onUpdate={updateList} />
            ))}
          </List>
        </Paper>
      ) : (
        <div style={{ maxWidth: 600, margin: 'auto', textAlign: 'center', marginTop: 60 }}>
          <img src={emptyListSvg} alt='Blank paper' style={{ maxWidth: 300 }} />
          <Typography component='h3' variant='h4' gutterBottom>
            <Trans>No list yet</Trans>
          </Typography>
          <Button variant='contained' color='primary' onClick={toggleListDialog}>
            <Trans>Create a list</Trans>
          </Button>
        </div>
      )}

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
}
