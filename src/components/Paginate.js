import { warn } from '../util/debug'

export default {
  name: 'paginate',
  props: {
    name: {
      type: String,
      required: true
    },
    list: {
      type: Array,
      required: true
    },
    listSize: {
      type: Number,
    },
    async: {
      type: Boolean,
      default: false
    },
    per: {
      type: Number,
      default: 3,
      validator (value) {
        return value > 0
      }
    },
    tag: {
      type: String,
      default: 'ul'
    }
  },
  data() {
    return {
      paginationInProgress: false,
    }
  },
  computed: {
    initialListSize() {
      return this.listSize || this.list.length;
    },
    currentPage: {
      get () {
        if (this.$parent.paginate[this.name]) {
          // console.log(this.$parent.paginate[this.name]);
          return this.$parent.paginate[this.name].page
        }
      },
      set(page) {
        this.$parent.paginate[this.name].page = page
        console.warn('paginating the list again as the current page is updated');
        this.paginateList();
      }
    },
    pageItemsCount () {
      const numOfItems = this.initialListSize
      const first = this.currentPage * this.per + 1
      const last = Math.min((this.currentPage * this.per) + this.per, numOfItems)
      return `${first}-${last} of ${numOfItems}`
    }
  },
  mounted () {
    if (this.per <= 0) {
      warn(`<paginate name="${this.name}"> 'per' prop can't be 0 or less.`, this.$parent)
    }
    if (!this.$parent.paginate[this.name]) {
      warn(`'${this.name}' is not registered in 'paginate' array.`, this.$parent)
      return
    }
    this.paginateList()
  },
  watch: {
    // currentPage () {
    //   this.paginateList()
    // },
    initialListSize() {
      console.warn('paginate list coz intialsize was changed');
      this.currentPage = 0
    },
    list() {
      console.warn('list updated: ', this.initialListSize, this.listSize);
      // if (this.initialListSize !== (this.listSize || this.list.length)) {
      //   // On list change, refresh the paginated list only if list size has changed
      //   console.warn('resetting page to 1 as the list sizes have changed: ', this.initialListSize, this.listSize);
      //   this.currentPage = 0
      // }
      this.paginateList();
    },
    per () {
      this.currentPage = 0
      // this.paginateList()
    }
  },
  methods: {
    paginateList() {
      if (this.paginationInProgress) return;
      this.paginationInProgress = true;
      const index = this.async ? 0 : this.currentPage * this.per;
      // console.log(this.listSize, this.list.length && JSON.stringify(this.list[0]), index);
      const paginatedList = this.list.slice(index, index + this.per)
      this.$parent.paginate[this.name].list = paginatedList
      setTimeout(() => {
        this.paginationInProgress = false;
      }, 50);
    },
    goToPage (page) {
      const maxPage = Math.ceil(this.initialListSize / this.per)
      if (page > maxPage) {
        warn(`You cannot go to page ${page}. The last page is ${maxPage}.`, this.$parent)
        return
      }
      this.currentPage = page - 1
    }
  },
  render (h) {
    return h(this.tag, {}, this.$slots.default)
  }
}
