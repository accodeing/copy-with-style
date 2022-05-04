'use babel';

/**
 * @class
 * Encapsulate the Atom editor so that generators can just call it with a per
 * line callback and get calls for the relevant lines.
 * Respects selections, even multiple selections, or processes all rows if no
 * selection has been made.
 */
export default class Editor {
  /**
   * @constructor
   * @param {function} on_done - The function to call when all lines have been
   * processed.
   */
  constructor( on_done ){
    this.on_done = on_done;
    this.editor = atom.workspace.getActiveTextEditor();
    this.editor.initialScrollTopRow = 0;
    this.el = atom.workspace.viewRegistry.getView( this.editor );
    
    this.lines = new Array( this.editor.getScreenLineCount() );
    
    this.mark_for_selections();
  }

  /**
   * Since we have the lines array to keep track of what lines we have already
   * processed, skipping a line if the cooresponding entry in the lines Array
   * is true, we can cheat a bit when it comes to selections by just marking the
   * parts of the lines array that arn't selected as already processed.
   * When we process lines later this will make the get_line method skip any
   * line that is not part of any selection.
   * This approach also lets us ignore selection order and automatically work
   * for multiple selections as well.
   * @summary Mark the lines array as processed for any line that is not part of
   * a selection.
   */
  mark_for_selections(){
    var lines;
    const selections = this.editor.getSelections().
      map(( selection ) => selection.getBufferRowRange()).
      map(( range ) => [this.editor.screenRowForBufferRow(range[0]),this.editor.screenRowForBufferRow(range[1])]).
      filter(( range ) => range[0] !== range[1]);

    if( selections.length === 0 ){ return; }

    this.lines.fill( true );
    selections.forEach(( range ) => this.lines.fill( false, range[0], range[1]+1 ));

  }

  /**
   * Main processing method called by generators.
   * @param {function} on_line - The function to call for each line.
   */
   
  force_scroll(){
    if (this.done) {
        return this.finalize();
    }
    this.el.setScrollTop(0)
    this.el.setScrollTop(this.el.getMaxScrollTop())
    this.editor.scrollToScreenPosition([this.last_processed_line+1,0])
  }
  process_lines( on_line ){
    this.on_line = on_line;
    this.last_processed_line = -1;
    this.original_scroll_position = this.el.getScrollTop()
    // this.original_scroll_pos= this.el.getFirstVisibleScreenRow();
    
    this.event_subscription = this.el.onDidChangeScrollTop( this.new_scroll_position.bind( this ));

    this.processed_first_element = false;
    this.done = false
    this.finalized = false;
    this.cl = atom.window.setInterval(this.force_scroll.bind(this),100)
  }

  finalize(){
    this.el.setScrollTop( this.original_scroll_position );
    if(this.finalized){ return; }
    console.log("Finalizing");
    this.finalized = true;
    // the following functions shall NOT be called twice !!
    atom.window.clearInterval(this.cl)
    this.event_subscription.dispose();
    // this.editor.scrollToScreenPosition([this.original_scroll_pos,0]);
    console.log("Callback on_done");
    this.on_done();
  }

  /**
   * This method is called on every scroll event, however the scrollevent is triggered before the the editor content is actually updated, hence we have
   * to do it the long way around instead:
   *  * Listen to everything.
   *  * Manually check if the editor is updated.
   *  * Process the new slice of the document.
   * We need a special guard for the first scroll event since the editor might
   * be part way down in a document and if we don't gueard it will just start
   * processing in the middle, loosing hte top, and finish when it reaches the
   * bottom.
   * @summary Handle scroll events. Processes the visible part of the editor.
   */
  new_scroll_position(){
    /* IMPORTANT NOTE: 
    * cannot use this.el.getFirstVisibleScreenRow()
    * or/and this.el.getLastVisibleScreenRow()
    * because their value are NOT in sync with what in actually displayed
    * in this editor and hence the reachable HTML that we want to extract 
    */
    const first_win_line = this.get_first_line_in_window()
    const last_win_line = this.get_last_line_in_window()
    console.log("Win First/last: " + first_win_line + " / " + last_win_line);
    /**
      * Special guard for the first scroll event since the editor might be part
      * way down in a document and if we don't gueard it will just start
      * processing in the middle, loosing the top, and finish when it reaches
      * the bottom.
      */
    const first_pass = this.last_processed_line == -1;
    const not_at_the_top = first_win_line != 0;
    const first_pass_but_not_at_the_top = first_pass && not_at_the_top;
    if( first_pass_but_not_at_the_top ){ return; }
    /**
     * Guard to ensure that subsequent scrolls have actually caused the editor
     * elements to update before processing.
     */
    const no_unprocessed_rows_visible = last_win_line <= this.last_processed_line;
    if( no_unprocessed_rows_visible ){ return; }
    
    /** Process visible lines */
    this.get_lines_in_window()
    
    /** Guard for when we are finished processing */
    const last_line = this.lines.length - 1;
    const all_lines_processed = this.last_processed_line == last_line;
    if( all_lines_processed ){ 
      this.done = true;
      return; 
    }
  }

  get_line( div ){
    if( !div.classList.contains( 'line' )){ return; }
    
    row = parseInt( div.dataset['screenRow']);
    buffrow = this.editor.bufferPositionForScreenPosition([row,0]);
    // console.log("getline #" + row + " (" + buffrow + ")");
    
    this.last_processed_line = Math.max( this.last_processed_line, row);
    if( this.lines[ row ]){ return; }
    
    this.on_line( div, row, buffrow);
    this.lines[ row ] = true;
    return;
  }

  get_lines_in_block( div ){
    var a = Array.from( div.children )
    for (var i = 0; i < a.length; i++) {
      this.get_line(a[i])
    }
  }
  
  get_lines_in_window(){
    // console.log("get_line_in_window");
    blocks = Array.from(
      this.el.querySelectorAll( '.lines > div:not([class])')
    );

    blocks.sort((a, b) => Number(a.children[0].dataset['screenRow']) - Number(b.children[0].dataset['screenRow']));

    for (var i = 0; i < blocks.length; i++) {
      this.get_lines_in_block(blocks[i])
    }
  }
  
  get_first_line_in_window(){
    blocks = Array.from(
      this.el.querySelectorAll( '.lines > div:not([class])')
    );
    blocks.sort((a, b) => Number(a.children[0].dataset['screenRow']) - Number(b.children[0].dataset['screenRow']));
    return blocks[0].children[0].dataset['screenRow'];
  }
  
  get_last_line_in_window(){
    blocks = Array.from(
      this.el.querySelectorAll( '.lines > div:not([class])')
    );
    // NB:  notice the inversion of a & b between the 2 fn 
    blocks.sort((a, b) => Number(b.children[0].dataset['screenRow']) - Number(a.children[0].dataset['screenRow']));
    c = blocks[0].children
    return c[c.length-1].dataset['screenRow'];
  }

}
