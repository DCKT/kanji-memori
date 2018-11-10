import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { Trans } from '@lingui/macro'
import Typography from '@material-ui/core/Typography'
import Word from '../components/Word'
import AddWordDialog from '../components/AddWordDialog'
import AddCategoryDialog from '../components/AddCategoryDialog'
import AuthenticatedNavigationBar from '../components/AuthenticatedNavigationBar'
import firebase, { onFirebaseValue, removeFirebaseValue } from '../services/firebase'
import emptyListSvg from '../assets/empty-list.svg'

const styles = theme => ({
  pageContainer: {
    height: '100%'
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30
  },
  emptyListPicture: {
    maxWidth: 450,
    marginBottom: theme.spacing.unit * 3
  },
  emptyContainer: {
    textAlign: 'center',
    height: 'calc(100% - 70px)'
  },
  emptyContainerActions: {
    marginTop: theme.spacing.unit * 4
  }
})

export default React.memo(
  withStyles(styles)(({ classes, viewer }) => {
    const [isAddWordDialogVisible, setIsAddWordDialogVisible] = useState(false)
    const [isAddCategoryDialogVisible, setIsAddCategoryDialogVisible] = useState(false)
    const [words, setWords] = useState(undefined)
    const hasWords = words !== undefined && words !== null

    function showCategoryDialog () {
      setIsAddCategoryDialogVisible(true)
    }

    function toggleAddWordDialog () {
      setIsAddWordDialogVisible(!isAddWordDialogVisible)
    }

    function removeWord (id) {
      removeFirebaseValue(`users/${viewer.uid}/words/${id}`)
    }

    useEffect(() => {
      onFirebaseValue(`users/${viewer.uid}/words`, setWords)
    }, [])

    return (
      <div className={classes.pageContainer}>
        <AuthenticatedNavigationBar onLogout={() => firebase.auth().signOut()} />
        {hasWords ? (
          <Button color='primary' onClick={showCategoryDialog} variant='contained'>
            <Trans>Add a category</Trans>
          </Button>
        ) : null}

        {words === undefined ? null : words ? (
          <Grid container spacing={24} wrap='wrap'>
            {Object.keys(words).map((word, i) => (
              <Grid item xs={12} sm={10} md={4} lg={2} key={i}>
                <Word word={words[word]} onDeleteButtonClick={() => removeWord(word)} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container alignItems='center' justify='center' spacing={24} className={classes.emptyContainer}>
            <Grid item xs={5}>
              <img src={emptyListSvg} alt='No words' className={classes.emptyListPicture} />
              <Typography component='h3' variant='h4' gutterBottom>
                <Trans>No words yet</Trans>
              </Typography>
              <div className={classes.emptyContainerActions} />
              <Button variant='contained' color='primary' onClick={toggleAddWordDialog}>
                <Trans>Add my first word</Trans>
              </Button>
              &nbsp;
              <Button color='primary' onClick={showCategoryDialog}>
                <Trans>Add a category</Trans>
              </Button>
            </Grid>
          </Grid>
        )}

        {hasWords ? (
          <Button variant='fab' color='primary' aria-label='Add' className={classes.fab} onClick={toggleAddWordDialog}>
            <AddIcon />
          </Button>
        ) : null}
        <AddWordDialog viewer={viewer} isVisible={isAddWordDialogVisible} onClose={toggleAddWordDialog} />
        <AddCategoryDialog
          isVisible={isAddCategoryDialogVisible}
          onClose={() => setIsAddCategoryDialogVisible(false)}
        />
      </div>
    )
  })
)
