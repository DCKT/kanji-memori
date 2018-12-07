// @flow

import React, { useState } from 'react'

/**
 * Components
 */
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import { Trans } from '@lingui/macro'
import SearchListsForm from '../../components/SearchListsForm'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'

/**
 * Utils
 */
import containerPicture from './assets/container.svg'
import { withStyles } from '@material-ui/core/styles'
import { map } from 'lodash'

const styles = theme => ({
  paperContainer: {
    maxWidth: 500,
    margin: 'auto',
    textAlign: 'center',
    paddingTop: theme.spacing.unit * 4,
    paddingBottom: theme.spacing.unit * 4
  },
  containerPicture: {
    maxWidth: 350,
    marginBottom: theme.spacing.unit * 2
  },
  formContainer: {
    maxWidth: 350,
    margin: 'auto',
    textAlign: 'left',
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    display: 'flex',
    flexWrap: 'wrap'
  },
  formControl: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  }
})

export default withStyles(styles)(({ classes, viewer, lists, words }) => {
  const [selectedLists, setSelectedLists] = useState([])
  const [trainingType, setTrainingType] = useState('')

  return (
    <div>
      <Typography component='h1' variant='h1' gutterBottom>
        <Trans>Training</Trans>
      </Typography>

      <Paper className={classes.paperContainer}>
        <img src={containerPicture} className={classes.containerPicture} />
        <Typography component='h2' variant='title'>
          <Trans>Pickup the lists you want to train</Trans>
        </Typography>

        <div className={classes.formContainer}>
          <FormControl className={classes.formControl} fullWidth>
            <SearchListsForm
              isMulti
              options={map(lists, list => ({
                label: list.name,
                value: list
              }))}
              onChange={values => setSelectedLists(values)}
            />
          </FormControl>
          <FormControl className={classes.formControl} fullWidth>
            <Select value={trainingType} onChange={event => setTrainingType(event.target.value)} displayEmpty>
              <MenuItem value='' disabled>
                <em>
                  <Trans>Select the training type</Trans>
                </em>
              </MenuItem>
              <MenuItem value='translate'>
                <Trans>Read Kanji</Trans>
              </MenuItem>
              <MenuItem value='write'>
                <Trans>Write kanji</Trans>
              </MenuItem>
            </Select>
          </FormControl>
        </div>

        {selectedLists.length && trainingType ? (
          <Button variant='contained' color='primary'>
            <Trans>Start training !</Trans>
          </Button>
        ) : null}
      </Paper>
    </div>
  )
})
