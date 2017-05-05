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
    this.el = atom.workspace.viewRegistry.getView( this.editor );

    this.lines = new Array( this.editor.buffer.lines.length );
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
      filter(( range ) => range[0] !== range[1]);

    if( selections.length === 0 ){ return; }

    this.lines.fill( true );
    selections.forEach(( range ) => this.lines.fill( false, range[0], range[1]+1 ));
  }

  /**
   * Main processing method called by generators.
   * @param {function} on_line - The function to call for each line.
   */
  process_lines( on_line ){
    this.on_line = on_line;
    this.last_processed_line = -1;
    this.original_scroll_position = this.el.getScrollTop();

    this.presenter_update_subscription = this.el.component.presenter.onDidUpdateState( this.new_scroll_position.bind( this ));

    this.processed_first_element = false;
    this.el.component.presenter.setScrollTop( 0 );
  }

  finalize(){
    this.presenter_update_subscription.dispose();
    this.el.component.presenter.setScrollTop( this.original_scroll_position );
    this.on_done();
  }

  /**
   * This method is called every time the presenter triggers its updated event,
   * which is a lot. Since there is no scroll event we can listen to that is
   * triggered AFTER the scrolling has actually affected the editor elements we
   * have to do it the long way around istead:
   *  * Listen to everything.
   *  * Manually check if hte editor is updated.
   *  * Process the new slice of the document.
   *  * Scroll down, unless finished, and repeat.
   * We need a special guard for the first scroll event since the editor might
   * be part way down in a document and if we don't gueard it will just start
   * processing in the middle, loosing hte top, and finish when it reaches the
   * bottom.
   * @summary Handle scroll events. Processes the visible part of the editor
   * and scrolls down when finished.
   */
  new_scroll_position(){
    /**
      * Special guard for the first scroll event since the editor might be part
      * way down in a document and if we don't gueard it will just start
      * processing in the middle, loosing the top, and finish when it reaches
      * the bottom.
      */
    const first_pass = this.last_processed_line == -1;
    const not_at_the_top = this.el.getFirstVisibleScreenRow() !== 0;
    const first_pass_but_not_at_the_top = first_pass && not_at_the_top;
    if( first_pass_but_not_at_the_top ){ return; }
    /**
     * Guard to ensure that subsequent scrolls have actually caused the editor
     * elements to update before processing.
     */
    const no_unprocessed_rows_visible = this.el.getLastVisibleScreenRow() <= this.last_processed_line;
    if( no_unprocessed_rows_visible ){ return; }

    /** Process visible lines */
    this.get_lines_in_window()

    /** Guard for when we are finished processing */
    const last_line = this.lines.length - 1;
    const all_lines_processed = this.last_processed_line == last_line;
    if( all_lines_processed ){ return this.finalize(); }

    /** Scroll down */
    this.el.component.presenter.setScrollTop( this.el.getScrollTop() + this.el.getHeight() );
  }

  get_line( div ){
    if( !div.classList.contains( 'line' )){ return; }

    row = parseInt( div.dataset['screenRow']);
    this.last_processed_line = Math.max( this.last_processed_line, row );

    if( this.lines[ row ]){ return; }

    this.on_line( div );
    this.lines[ row ] = true;
  }

  get_lines_in_block( div ){
    Array.from( div.children ).forEach( this.get_line.bind( this ));
  }

  get_lines_in_window(){
    var blocks, lines = [];

    this.editor = atom.workspace.getActiveTextEditor();
    this.el = atom.workspace.viewRegistry.getView( this.editor );

    blocks = Array.from(
      this.el.querySelector( '.lines > div:not([class])').children
    );

    blocks.sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex));

    blocks.forEach( this.get_lines_in_block.bind( this ));

    return lines;
  }
}
