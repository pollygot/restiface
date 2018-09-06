<template>
<div class="">

  <!-- <div class="columns">
    <div class="column" v-for="(column, index) in columns" v-bind:style="{width: column.width}" :key="index">
      {{column.label || column.name}}
    </div>
  </div> -->
  <div class="box has-corners">
      <table class="table is-responsive is-fullwidth is-hoverable" v-bind:class="{ 'is-small': tableSize === 'SMALL' }">
        <thead>
          <tr>
            <th width="20" class="p-r-none">
              <div class="field">
                <input class="is-checkradio is-small" id="exampleCheckbox" type="checkbox" name="exampleCheckbox">
                <label for="exampleCheckbox" class="p-r-none"></label>
              </div>
            </th>
            <th v-for="(column, i) in columns" :key="'col-h'+i">
              <a
                @click="$emit('onSort', column)"
                :class="{
                  'sort-desc': (sortColumn === column && sortDirection === 'desc'),
                  'sort-asc': (sortColumn === column && sortDirection === 'asc')
                }"
              >
                {{column}}
              </a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in records" :key="'record-'+index">
            <td class="p-r-none">
              <div class="field">
                <input class="is-checkradio is-small" id="exampleCheckbox" type="checkbox" name="exampleCheckbox">
                <label for="exampleCheckbox" class="p-r-none"></label>
              </div>
            </td>
            <td v-for="(column, i) in columns" :key="'col-td'+i"  @click="$emit('onRecordClicked', record)" >
              <span>
                {{
                  record[`${column}`] ||
                  (record[`${column}`] !== null)
                    ? record[`${column}`].toString()
                    : '&nbsp;'
                }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
  </div>

</div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'Table',
  props: {
    columns: { required: true, type: Array },
    records: { required: true, type: Array }, // the data to be displayed
    sortColumn: { required: false, type: String },
    sortDirection: { required: false, type: String },
    tableSize: { required: false, type: String, default: 'SMALL' } // how large the text / cell size is
  },
  data: function () {
    return {
    }
  },
  computed: {
  },
  methods: {
    getDateAndTime: function (dateString) {
      if (!dateString) return null
      return moment(dateString).format('HH:mm - DD MMM YYYY')
    },
    getDate: function (dateString) {
      if (!dateString) return null
      return moment(dateString).format('DD MMM YYYY')
    },
    getValue: function (column, record) {
      let value = record[`${column.key}`]
      if (value && column.modifier) value = column.modifier(value)
      return value
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.box {
  padding: 0;
  overflow: hidden;
  overflow-x: scroll;
  .table {
    &.is-small {
      font-size: 0.8em;
    }
    td {
      cursor: pointer;
      white-space:nowrap;

      figure {
        box-shadow: 0px 0px 3px 2px rgba(0,0,0,0.1) !important;
      }
    }
    th {
      white-space:nowrap;
    }
  }
  a.sort-down:after {
   content: ' ▾';
  }
  a.sort-up:after {
   content: ' ▴';
  }
  .switch-field  {
    padding-top: 3px;
    margin-bottom: -3px;
  }
}

@media screen and (max-width: 800px) {

  .box {
    a.sort-down:after {
     content: ' ▸';
    }
    a.sort-up:after {
     content: ' ◂';
    }
  }
  .is-responsive {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    display: block;
    position: relative;
  }
  .is-responsive td:empty:before {
    content: '\00a0';
  }
  .is-responsive th,
  .is-responsive td {
    margin: 0;
    vertical-align: top;
  }
  .is-responsive th {
    text-align: left !important;
    // border: 1px solid #fff;
    width: 100% !important;
  }
  .is-responsive thead {
    border-right: solid 2px #dbdbdb;
    display: block;
    float: left;
  }
  .is-responsive thead tr {
    display: block;
    padding: 0 10px 0 0;
  }
  // .is-responsive thead tr th::before {
  //   content: "\00a0";
  // }
  .is-responsive thead td,
  .is-responsive thead th {
    border-width: 0 0 1px;
  }
  .is-responsive tbody {
    display: block;
    width: auto;
    position: relative;
    overflow-x: auto;
    white-space: nowrap;
  }
  .is-responsive tbody tr {
    display: inline-block;
    vertical-align: top;
  }
  .is-responsive th {
    display: block;
    text-align: right;
  }
  .is-responsive td {
    display: block;
    min-height: 1.25em;
    text-align: left;
  }
  .is-responsive th:last-child,
  .is-responsive td:last-child {
    border-bottom-width: 0;
  }
  .is-responsive tr:last-child td:not(:last-child) {
    border: 1px solid #dbdbdb;
    border-width: 0 0 1px;
  }
  .is-responsive.is-bordered td,
  .is-responsive.is-bordered th {
    border-width: 1px;
  }
  .is-responsive.is-bordered tr td:last-child,
  .is-responsive.is-bordered tr th:last-child {
    border-bottom-width: 1px;
  }
  .is-responsive.is-bordered tr:last-child td,
  .is-responsive.is-bordered tr:last-child th {
    border-width: 1px;
  }
}
</style>