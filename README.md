
# cssmodeling

CSS Modeling creates an iterative process that codifies an application's design into CSS variables and atoms. This allows for a single source of truth for how a design should be implemented with greater power to iterate towards a solution, more compact live documentation, and greater flexibility to integrate into prototyping and production code.

## Grunt Implementation
```
cssmodeling:{
    files: {
        'dist/csscore':
        [
            'cssmodeling/css_schemes.json',
            'cssmodeling/systems/css_rows_quartered.json',
            'cssmodeling/systems/css_12_col_vw_quartered.json',
            'cssmodeling/skins/css_client_skin.json',
            'cssmodeling/systems/css_simple.json',
            'cssmodeling/css_states.json'
        ]
    },
    options: {
        resets:[
            'cssmodeling/_resets/**/*.css'
        ],
        type:"scss",
        var_prefix:"v-"
    }
}
```
```
cssmodeling:{
    files: {
        dest:[source]   // destination folder followed by your array of source json config files
    },
    options: {
        resets:         // array of css files to inject before the CSS core
        type:           // scss or less
        var_prefix      // if set, this will prefix all the variables
    }
}
```

CSS Modeling will also process your components/objects for the style guide via a different grunt process:
```
cssmodeling_components:{
    files: {
        'dist/csscore':
        [
            'prototype/dist/client.css'
        ]
    }
}
```
Process the components into 'client.css' and this process will create the components.json file for the style guide. It should target the same folder as the cssmodeling process.


## Usage

CSS Modeling creates these files (if you choose SCSS)

```
core.css                    // CSS core processed into usable CSS
scss/
    _core_mixins.scss       // just variables and atom mixins
    core.scss               // resets, variables, atom rules and mixins
styleguide/
    cmod_styleguide.css     // powers style guide
    cmod_styleguide.js      // powers style guide
    cssmodeling.json        // processed information about CSS Core
    index.html              // run this to see style guide
```

If you are also processing your components for the style guide it will also create these files:
```
components.css              // CSS components processed into usable CSS
styleguide/
    components.json         // your components CSS processed into JSON
```

You can integrate CSS modeling into your repo directly or import files via Bower .


## Concepts

#### Schemes

Patterns (large, larger, largest..etc) that are used to unpack all the variations of variables and atoms as well as to display the shortcuts for the style guide ( "color-[ light, lighter, lightest ]" ).


#### BEMIT
Naming convention for Components and Objects [BEMIT](http://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/):

```
Type-Block__Element--Modifier  
c-advisorNav__link
c-advisor__link--selected
```

#### Variables

CSS Variables used in SCSS or LESS. Can be prefixed in grunt config.

#### Atoms

Atoms are rules with one ( or very few ) declarations. They generally take the variables and surface them for simple use around the application. They can be used on the HTML themselves or via Mixins within CSS components or objects.

#### (CSS) Component

A component is the cluster of rules (elements and modifiers) needed to define a block within the application. A component generally gets implemented once versus an object that is implemented in a number of locations.
```
.c-appNavigation {

    // an element
    &__item {

    }

    // a modifier
    &--disabled {

    }
}
```

#### (CSS) Object

An object is the same as a component except that it can be reused. The idea is that it is more dangerous to change an object versus a component.

```
.o-tabNavigation {

    // an element
    &__item {

    }

    // a modifier
    &--disabled {

    }
}
```

#### Groups/Subgroup

These are purely for the sake of organizing the elements within the style guide.

#### Resets

The base resets needed for the core ( normalize.css for instance )


## CSS Core Implementation

You can implement the core one of three ways:

### Variables

Use a variable directly:

```scss
width: $v-col-2;
```
### Atom Classes

Add to any HTML element's class:

```html
<div class="a-width-col-2"></div>
```
### Component/Object SCSS Mixins

Add to any Component/Object SCSS file:

```scss
@include a-width-col-2();

/* you can also override... */
$navigationWidth: $v-col-4;
@include a-width-col( $navigationWidth );
@include a-padding-left-col( $navigationWidth );
```


## Updating Core (Variables/Atoms)

JSON files are utilized to produce the variables and Atoms (mixins and rules). This enables the faster iterations of CSS solutions and automatic creation of the more compact, living style guide. ( The Components and Objects of the system should always be created in individual SCSS or LESS files. ).

The JSON files can be organized according to your needs. All elements within the files are pushed into a single configuration with this structure:

```
{
    "groups":{},
    "sub_groups":{},
    "schemes":{},
    "variables":[],
    "utilities":[],
    "atoms":[],
    "states":{}
}
```

#### Groups/Sub Groups Structure

Groups and Sub Groups are used to organize the style guide

```
{
    "groups":{
		"simple":{
			"title":"Simple Title"
		}
    },
    "sub_groups":{
		"color":{
			"title":"Colors Title"
		}
    }
}
```

#### Schemes Structure

The scheme itself is either a string, object, or array that is unpacked into a series of names.

```
{
    "schemes":{
        "color-values":{
			"shortcut":"<em>@base</em>-[ light[ er, est ], dark[ er, est ] ]",
			"scheme":{"@base":
						[
							"",
							{"-light":["","er","est"]},
							{"-dark":["","er","est"]}
						]
					}
		}
    }
}
```

```
{
    "schemes":{
        "color-values":{
			"shortcut":  // string used in the style guide that summarizes the scheme
			"scheme":    // the object that unpacks into a list of names
		}
    }
}
```

unpacks into this:

```
// Shortcut
<em>purple</em>-[ light[ er, est ], dark[ er, est ] ]

// Sheme
[
    "purple"
	"purple-light",
    "purple-lighter",
    "purple-lightest",
    "purple-dark",
    "purple-darker",
    "purple-darkest"
]
```

You can also reference other schemes within schemes:

```
{
    "schemes":{
        "location-size-values":{
            "shortcut":"<em>@base</em>-[ top [ -large[ r, st ] , -small[ er, est ], bottom..., left..., right... ]",
            "scheme":{"@base":
                        [
                            {"":"scheme:size-values"},
                            {"-top":"scheme:size-values"},
                            {"-bottom":"scheme:size-values"},
                            {"-left":"scheme:size-values"},
                            {"-right":"scheme:size-values"}
                        ]
                    }
        }
    }
}
```

With a base of "border"

```
// Scheme
[
    "border","border-large","border-larger",...
    "border-top","border-top-large","border-top-larger",...
    "border-bottom","border-bottom-large","border-bottom-larger",...
    "border-left","border-left-large","border-left-larger",...
    "border-right","border-right-large","border-right-larger",...
]
```


#### Variables Structure

Variables take the schemes and apply values to them. They usually also define the atoms that then take the variables and create mixins/rules with declarations using the variables.

```
{
    "variables":[

        {
            "name":"purple-color",
            "group":"skin",
            "base":"purple",
            "scheme":"color-values",
            "values":[
                "#7942B6",
                "#8C4DD3","#9F57EF","#AA5CFF",
                "#623594","#48276C","#221333"
            ]
            "atoms":[
                {
                    "name":"purple-background",
                    "group":"skin",
                    "sub_group":"color",
                    "example":"<div ... style='height: 100px; width: 100px'></div>",
                    "selector":".a-background-@var_name",
                    "declaration_value":"background-color: @var_value;"
                }
            ]
        }
    ]
}
```

```
{
    "variables":[

        {
            "name":             // unique name of variable
            "group":            // group to place the variable within
            "base":             // the root or base string to inject into the scheme
            "scheme":           // reference to scheme name ( or could be actual scheme )
            "shortcut":         // (optional) a scheme shortcut...when declaring the scheme in the variable.
            "ignore_variable"   // (optional) ignore creating this variable
            "values"            // values to associate with scheme names ( need to be in same order as names )
            "atoms"             // atoms to create using this variable
        }
    ]
}
```
unpacks into this (using a variable prefix...):

```
// Variables

$v-purple: #7942B6;
$v-purple-light: #8C4DD3;
...

// Atom Rules

.a-background-purple {
    background-color: $v-purple;
}
.a-background-purple-light {
    background-color: $v-purple-light;
}
...

// Atom Mixins ( SCSS shown...argument is for overrides )

@mixin a-background-purple ( $v-purple : $v-purple ) {
    background-color: $v-purple;
}
@mixin a-background-purple-light ( $v-purple-light : $v-purple-light )  {
    background-color: $v-purple-light;
}
...

```
Example of a variable declaring it's own scheme and ignoring creating a variable

```
{
    "variables":[

        {
            "name":"binary-values",
            "group":"simple",
            "base":"binary",
            "shortcut":"<em>@base</em>-[ 0 , 100 ]",
			"scheme":{"@base":
						["-0","-100"]
					},
            "values":[
                "0","100%"
            ],
            "ignore_variable":true,
            "atoms":[
                {
                    "name":"binary-width",
                    "group":"simple",
                    "sub_group":"sizing",
                    "example":"<div ... style='height: 100px; background-color:#fff;'></div>",
                    "selector":".a-width@var_name_no_base",
                    "declaration_value":"width: @var_value;"
                }
        }
    ]
}
```
unpacks into this (using a variable prefix...):

```
// Variables (none)

// Atom Rules

.a-width-0 {
    width: 0;
}
.a-width-100 {
    width: 100%;
}

// Atom Mixins (SCSS shown)

@mixin .a-width-0 () {
    width: 0;
}
@mixin a-width-100 () {
    width: 100%;
}

```


#### Atoms/Utilities Structure

Atoms and Utilities are treated the same. They generally iterate over a variable (can be created without a variable) and create a rule for each variable in the scheme.

```
{
    "atoms":[
        {
            "name":"width-default-values",
            "group":"simple",
            "sub_group":"sizing",
            "variable":"size-default-values",
            "example":"<div ... style='width: 100%; background-color:#fff;'></div>",
            "selector":".a-width@var_name",
            "declaration_value":"width : @var_value;"
        }
    ]
}
```


```
{
    "atoms":[
        {
            "name":                 // unique name,
            "group":                // style guide grouping
            "sub_group"             // style guide sub grouping
            "variable"              // variable to iterate over.
            "example"               // HTML example to show in style guide preview,
            "selector"              // selector for rule and also mixin name.

            // one or more of the following are required

            "declaration_value"     // single declaration
            "declaration_values"    // declaration array
            "declaration_includes"  // array of mixins that this mixin wants to reference
        }
    ]
}
```

Selector and declaration values can use these replacement values:

```
_@_                 // replaced to the variable character (less = "@", scss = "$")
_inc_               // replaced to the mixin syntax (less = ".", scss = "@include ")
@var_name           // name of the variable (purple, purple-light, etc)
@var_value          // value of the variable (#8C4DD3,#9F57EF, etc)
@var_name_no_base   // name of the variable without the base ( -light, -lighter, etc)

```


An example without a variable.

```
{
    "atoms":[
        {
            "name":"flex-center",
            "group":"simple",
            "sub_group":"positioning",
            "selector":".a-flex-center",
            "declaration_lines":[
                "justify-content: center;",
                "& > * { align-self: center; }"
            ],
            "declaration_includes":[
                "_inc_a-display-flex;"
            ]
        }
    ]
}
```


## Updating Components/Objects

These should be created and organized within your prototype and production code. They should generally follow the BEMIT structure and should try to utilize the CSS Core variables and atoms as much as possible:

```
.c-appNavigation {
    @include a-width-col-3;

    &__item {
        @include a-width-100;
        @include a-height-row-3;
    }
}
```

If you are using CSS Modeling to document the Comps/Objects then adding -ctag-example will bring up a preview. The terse templating language will keep maintenance low.

```
.c-appNavigation {
    /* -ctag-example: ...
        { .c-appNavigation__item }
        { .c-appNavigation__item }
        { .c-appNavigation__item };*/
    @include a-width-col-3;

    &__item {
        /* -ctag-example: ...Nav Item;*/
        @include a-width-100;
        @include a-height-row-3;
    }
}
```

#### -ctag-example Examples

Inject a div with the class name:

```
.c-appNavigation {
    /* -ctag-example: ...;*/
}

// replaces to
<div class="c-appNavigation"></div>
```

Inject just the class name:

```
.c-appNavigation {
    /* -ctag-example: <span ...></span>;*/
}

// replaces to
<span class="c-appNavigation"></span>
```

Inject div around content:

```
.c-appNavigation {
    /* -ctag-example: ...Title;*/
}

// replaces to
<div class="c-appNavigation">Title</div>
```

Inject div around content with other examples:

```
.c-appNavigation {
    /* -ctag-example: ...
        { .c-appNavigation__item }
        { .c-appNavigation__item }
        { .c-appNavigation__item };*/
    @include a-width-col-3;

    &__item {
        /* -ctag-example: ...Nav Item;*/
        @include a-width-100;
        @include a-height-row-3;
    }
}

// replaces to
<div class="c-appNavigation">
    <div class="c-appNavigation__item">Nav Item</div>
    <div class="c-appNavigation__item">Nav Item</div>
    <div class="c-appNavigation__item">Nav Item</div>
</div>
```
